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
import { Body, Controller, Get, Param, Post, Delete, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ChatService } from './chat.service.js';
import { AddMemberDto, CreateDirectConversationDto, CreateGroupConversationDto, SendMessageDto, } from './dto.js';
let ChatController = class ChatController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
    }
    userId(req) {
        return req.user.userId;
    }
    users(req) {
        return this.chatService.getCompanyUsers(this.userId(req));
    }
    conversations(req) {
        return this.chatService.listConversations(this.userId(req));
    }
    direct(req, dto) {
        return this.chatService.createDirect(this.userId(req), dto.userId);
    }
    group(req, dto) {
        return this.chatService.createGroup(this.userId(req), dto.name, dto.userIds);
    }
    messages(req, conversationId) {
        return this.chatService.getMessages(this.userId(req), conversationId);
    }
    sendMessage(req, conversationId, dto) {
        return this.chatService.sendMessage(this.userId(req), conversationId, dto.content);
    }
    members(req, conversationId) {
        return this.chatService.getMembers(this.userId(req), conversationId);
    }
    addMember(req, conversationId, dto) {
        return this.chatService.addMember(this.userId(req), conversationId, dto.userId);
    }
    removeMember(req, conversationId, memberId) {
        return this.chatService.removeMember(this.userId(req), conversationId, memberId);
    }
};
__decorate([
    Get('users'),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "users", null);
__decorate([
    Get('conversations'),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "conversations", null);
__decorate([
    Post('conversations/direct'),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateDirectConversationDto]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "direct", null);
__decorate([
    Post('conversations/group'),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateGroupConversationDto]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "group", null);
__decorate([
    Get('conversations/:id/messages'),
    __param(0, Req()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "messages", null);
__decorate([
    Post('conversations/:id/messages'),
    __param(0, Req()),
    __param(1, Param('id')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, SendMessageDto]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "sendMessage", null);
__decorate([
    Get('conversations/:id/members'),
    __param(0, Req()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "members", null);
__decorate([
    Post('conversations/:id/members'),
    __param(0, Req()),
    __param(1, Param('id')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, AddMemberDto]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "addMember", null);
__decorate([
    Delete('conversations/:id/members/:memberId'),
    __param(0, Req()),
    __param(1, Param('id')),
    __param(2, Param('memberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "removeMember", null);
ChatController = __decorate([
    UseGuards(JwtAuthGuard),
    Controller('chat'),
    __metadata("design:paramtypes", [ChatService])
], ChatController);
export { ChatController };
//# sourceMappingURL=chat.controller.js.map