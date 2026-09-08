import type { Request } from 'express';
import { ChatService } from './chat.service.js';
import { AddMemberDto, CreateDirectConversationDto, CreateGroupConversationDto, SendMessageDto } from './dto.js';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    private userId;
    users(req: Request): Promise<import("../users/user.entity.js").User[]>;
    conversations(req: Request): Promise<{
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
    direct(req: Request, dto: CreateDirectConversationDto): Promise<import("./chat.entity.js").ChatConversation>;
    group(req: Request, dto: CreateGroupConversationDto): Promise<import("./chat.entity.js").ChatConversation>;
    messages(req: Request, conversationId: string): Promise<{
        id: string;
        content: string;
        senderId: string;
        senderName: string;
        createdAt: Date;
    }[]>;
    sendMessage(req: Request, conversationId: string, dto: SendMessageDto): Promise<{
        id: string;
        content: string;
        senderId: string;
        senderName: string;
        createdAt: Date;
    }>;
    members(req: Request, conversationId: string): Promise<{
        id: string;
        displayName: string;
        email: string;
    }[]>;
    addMember(req: Request, conversationId: string, dto: AddMemberDto): Promise<{
        message: string;
    }>;
    removeMember(req: Request, conversationId: string, memberId: string): Promise<{
        message: string;
    }>;
}
