import { Body, Controller, Get, Param, Post, Delete, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ChatService } from './chat.service.js';
import {
  AddMemberDto,
  CreateDirectConversationDto,
  CreateGroupConversationDto,
  SendMessageDto,
} from './dto.js';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  private userId(req: Request) {
    return (req.user as { userId: string }).userId;
  }

  @Get('users')
  users(@Req() req: Request) {
    return this.chatService.getCompanyUsers(this.userId(req));
  }

  @Get('conversations')
  conversations(@Req() req: Request) {
    return this.chatService.listConversations(this.userId(req));
  }

  @Post('conversations/direct')
  direct(@Req() req: Request, @Body() dto: CreateDirectConversationDto) {
    return this.chatService.createDirect(this.userId(req), dto.userId);
  }

  @Post('conversations/group')
  group(@Req() req: Request, @Body() dto: CreateGroupConversationDto) {
    return this.chatService.createGroup(this.userId(req), dto.name, dto.userIds);
  }

  @Get('conversations/:id/messages')
  messages(@Req() req: Request, @Param('id') conversationId: string) {
    return this.chatService.getMessages(this.userId(req), conversationId);
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @Req() req: Request,
    @Param('id') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(this.userId(req), conversationId, dto.content);
  }

  @Get('conversations/:id/members')
  members(@Req() req: Request, @Param('id') conversationId: string) {
    return this.chatService.getMembers(this.userId(req), conversationId);
  }

  @Post('conversations/:id/members')
  addMember(
    @Req() req: Request,
    @Param('id') conversationId: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.chatService.addMember(this.userId(req), conversationId, dto.userId);
  }

  @Delete('conversations/:id/members/:memberId')
  removeMember(
    @Req() req: Request,
    @Param('id') conversationId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.chatService.removeMember(this.userId(req), conversationId, memberId);
  }
}
