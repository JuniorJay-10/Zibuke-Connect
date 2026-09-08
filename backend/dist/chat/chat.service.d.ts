import { Repository } from 'typeorm';
import { User } from '../users/user.entity.js';
import { ChatConversation, ChatMember, ChatMessage } from './chat.entity.js';
export declare class ChatService {
    private readonly conversations;
    private readonly members;
    private readonly messages;
    private readonly users;
    constructor(conversations: Repository<ChatConversation>, members: Repository<ChatMember>, messages: Repository<ChatMessage>, users: Repository<User>);
    getCompanyUsers(currentUserId: string): Promise<User[]>;
    listConversations(userId: string): Promise<{
        id: string;
        type: "direct" | "group";
        name: string | null;
        createdById: string;
        createdAt: Date;
        members: {
            id: string;
            displayName: string;
            email: string;
            sipExtension: string;
        }[];
        lastMessage: {
            content: string;
            senderId: string;
            senderName: string;
            createdAt: Date;
        } | null;
    }[]>;
    createDirect(userId: string, otherUserId: string): Promise<ChatConversation>;
    createGroup(userId: string, name: string, userIds: string[]): Promise<ChatConversation>;
    getMessages(userId: string, conversationId: string): Promise<{
        id: string;
        content: string;
        senderId: string;
        senderName: string;
        createdAt: Date;
    }[]>;
    sendMessage(userId: string, conversationId: string, content: string): Promise<{
        id: string;
        content: string;
        senderId: string;
        senderName: string;
        createdAt: Date;
    }>;
    addMember(userId: string, conversationId: string, newUserId: string): Promise<{
        message: string;
    }>;
    removeMember(userId: string, conversationId: string, memberId: string): Promise<{
        message: string;
    }>;
    getMembers(userId: string, conversationId: string): Promise<{
        id: string;
        displayName: string;
        email: string;
    }[]>;
    private ensureMember;
    private getConversation;
}
