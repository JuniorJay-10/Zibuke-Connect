var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { BadRequestException, ForbiddenException, Injectable, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { User } from '../users/user.entity.js';
import { ChatConversation, ChatMember, ChatMessage, } from './chat.entity.js';
let ChatService = class ChatService {
    conversations;
    members;
    messages;
    users;
    constructor(conversations, members, messages, users) {
        this.conversations = conversations;
        this.members = members;
        this.messages = messages;
        this.users = users;
    }
    async getCompanyUsers(currentUserId) {
        return this.users.find({
            select: { id: true, displayName: true, email: true, sipExtension: true },
            where: { id: Not(currentUserId) },
            order: { displayName: 'ASC' },
        });
    }
    async listConversations(userId) {
        const memberships = await this.members.find({
            where: { userId },
            relations: { conversation: true },
            order: { joinedAt: 'DESC' },
        });
        const conversationIds = memberships.map((m) => m.conversationId);
        if (!conversationIds.length)
            return [];
        const allMembers = await this.members.find({
            where: { conversationId: In(conversationIds) },
            relations: { user: true },
        });
        const latestMessages = await Promise.all(conversationIds.map(async (conversationId) => {
            const message = await this.messages.findOne({
                where: { conversationId },
                relations: { sender: true },
                order: { createdAt: 'DESC' },
            });
            return [conversationId, message];
        }));
        const latestByConversation = new Map(latestMessages);
        return memberships.map((membership) => ({
            id: membership.conversation.id,
            type: membership.conversation.type,
            name: membership.conversation.name,
            createdById: membership.conversation.createdById,
            createdAt: membership.conversation.createdAt,
            members: allMembers
                .filter((member) => member.conversationId === membership.conversationId)
                .map((member) => ({
                id: member.user.id,
                displayName: member.user.displayName,
                email: member.user.email,
                sipExtension: member.user.sipExtension,
            })),
            lastMessage: latestByConversation.get(membership.conversationId)
                ? {
                    content: latestByConversation.get(membership.conversationId)?.content ?? '',
                    senderId: latestByConversation.get(membership.conversationId)?.senderId ?? '',
                    senderName: latestByConversation.get(membership.conversationId)?.sender?.displayName ?? '',
                    createdAt: latestByConversation.get(membership.conversationId)?.createdAt ?? new Date(),
                }
                : null,
        }));
    }
    async createDirect(userId, otherUserId) {
        if (userId === otherUserId) {
            throw new BadRequestException('You cannot start a chat with yourself');
        }
        const otherUser = await this.users.findOne({ where: { id: otherUserId } });
        if (!otherUser)
            throw new NotFoundException('User not found');
        const ownMemberships = await this.members.find({ where: { userId } });
        for (const membership of ownMemberships) {
            const conversation = await this.conversations.findOne({
                where: { id: membership.conversationId, type: 'direct' },
            });
            if (!conversation)
                continue;
            const pair = await this.members.count({
                where: {
                    conversationId: conversation.id,
                    userId: In([userId, otherUserId]),
                },
            });
            const total = await this.members.count({ where: { conversationId: conversation.id } });
            if (pair === 2 && total === 2)
                return conversation;
        }
        const conversation = await this.conversations.save(this.conversations.create({
            type: 'direct',
            name: null,
            createdById: userId,
        }));
        await this.members.save([
            this.members.create({ conversationId: conversation.id, userId }),
            this.members.create({ conversationId: conversation.id, userId: otherUserId }),
        ]);
        return conversation;
    }
    async createGroup(userId, name, userIds) {
        const uniqueIds = Array.from(new Set([userId, ...userIds]));
        const users = await this.users.find({ where: { id: In(uniqueIds) } });
        if (users.length !== uniqueIds.length) {
            throw new BadRequestException('One or more selected users do not exist');
        }
        const conversation = await this.conversations.save(this.conversations.create({ type: 'group', name, createdById: userId }));
        await this.members.save(uniqueIds.map((memberId) => this.members.create({ conversationId: conversation.id, userId: memberId })));
        return conversation;
    }
    async getMessages(userId, conversationId) {
        await this.ensureMember(userId, conversationId);
        const messages = await this.messages.find({
            where: { conversationId },
            relations: { sender: true },
            order: { createdAt: 'ASC' },
            take: 200,
        });
        return messages.map((message) => ({
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            senderName: message.sender.displayName,
            createdAt: message.createdAt,
        }));
    }
    async sendMessage(userId, conversationId, content) {
        await this.ensureMember(userId, conversationId);
        const message = await this.messages.save(this.messages.create({ conversationId, senderId: userId, content: content.trim() }));
        const withSender = await this.messages.findOne({
            where: { id: message.id },
            relations: { sender: true },
        });
        if (!withSender)
            throw new NotFoundException('Message could not be loaded');
        return {
            id: withSender.id,
            content: withSender.content,
            senderId: withSender.senderId,
            senderName: withSender.sender.displayName,
            createdAt: withSender.createdAt,
        };
    }
    async addMember(userId, conversationId, newUserId) {
        const conversation = await this.getConversation(conversationId);
        if (conversation.type !== 'group')
            throw new BadRequestException('Only group chats support members');
        if (conversation.createdById !== userId)
            throw new ForbiddenException('Only the group creator can manage members');
        const newUser = await this.users.findOne({ where: { id: newUserId } });
        if (!newUser)
            throw new NotFoundException('User not found');
        const exists = await this.members.findOne({ where: { conversationId, userId: newUserId } });
        if (!exists) {
            await this.members.save(this.members.create({ conversationId, userId: newUserId }));
        }
        return { message: 'Member added' };
    }
    async removeMember(userId, conversationId, memberId) {
        const conversation = await this.getConversation(conversationId);
        if (conversation.type !== 'group')
            throw new BadRequestException('Only group chats support members');
        if (conversation.createdById !== userId)
            throw new ForbiddenException('Only the group creator can manage members');
        if (memberId === conversation.createdById)
            throw new BadRequestException('The group creator cannot be removed');
        const result = await this.members.delete({ conversationId, userId: memberId });
        if (!result.affected)
            throw new NotFoundException('Member is not in this group');
        return { message: 'Member removed' };
    }
    async getMembers(userId, conversationId) {
        await this.ensureMember(userId, conversationId);
        return this.members.find({
            where: { conversationId },
            relations: { user: true },
            order: { joinedAt: 'ASC' },
        }).then((members) => members.map((member) => ({
            id: member.user.id,
            displayName: member.user.displayName,
            email: member.user.email,
        })));
    }
    async ensureMember(userId, conversationId) {
        const membership = await this.members.findOne({ where: { conversationId, userId } });
        if (!membership)
            throw new ForbiddenException('You are not a member of this conversation');
    }
    async getConversation(conversationId) {
        const conversation = await this.conversations.findOne({ where: { id: conversationId } });
        if (!conversation)
            throw new NotFoundException('Conversation not found');
        return conversation;
    }
};
ChatService = __decorate([
    Injectable(),
    __param(0, InjectRepository(ChatConversation)),
    __param(1, InjectRepository(ChatMember)),
    __param(2, InjectRepository(ChatMessage)),
    __param(3, InjectRepository(User)),
    __metadata("design:paramtypes", [Repository,
        Repository,
        Repository,
        Repository])
], ChatService);
export { ChatService };
//# sourceMappingURL=chat.service.js.map