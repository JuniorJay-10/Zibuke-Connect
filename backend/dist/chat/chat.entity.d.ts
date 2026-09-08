import { type Relation } from 'typeorm';
import { User } from '../users/user.entity.js';
export declare class ChatConversation {
    id: string;
    type: 'direct' | 'group';
    name: string | null;
    createdById: string;
    createdBy: Relation<User>;
    createdAt: Date;
}
export declare class ChatMember {
    id: string;
    conversationId: string;
    conversation: Relation<ChatConversation>;
    userId: string;
    user: Relation<User>;
    joinedAt: Date;
}
export declare class ChatMessage {
    id: string;
    conversationId: string;
    conversation: Relation<ChatConversation>;
    senderId: string;
    sender: Relation<User>;
    content: string;
    createdAt: Date;
}
