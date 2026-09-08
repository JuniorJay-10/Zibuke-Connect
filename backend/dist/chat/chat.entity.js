var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, } from 'typeorm';
import { User } from '../users/user.entity.js';
let ChatConversation = class ChatConversation {
    id;
    type;
    name;
    createdById;
    createdBy;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], ChatConversation.prototype, "id", void 0);
__decorate([
    Column({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], ChatConversation.prototype, "type", void 0);
__decorate([
    Column({ type: 'varchar', length: 120, nullable: true }),
    __metadata("design:type", Object)
], ChatConversation.prototype, "name", void 0);
__decorate([
    Column({ type: 'uuid' }),
    __metadata("design:type", String)
], ChatConversation.prototype, "createdById", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'createdById' }),
    __metadata("design:type", Object)
], ChatConversation.prototype, "createdBy", void 0);
__decorate([
    CreateDateColumn({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], ChatConversation.prototype, "createdAt", void 0);
ChatConversation = __decorate([
    Entity('chat_conversations')
], ChatConversation);
export { ChatConversation };
let ChatMember = class ChatMember {
    id;
    conversationId;
    conversation;
    userId;
    user;
    joinedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], ChatMember.prototype, "id", void 0);
__decorate([
    Column({ type: 'uuid' }),
    __metadata("design:type", String)
], ChatMember.prototype, "conversationId", void 0);
__decorate([
    ManyToOne(() => ChatConversation, { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'conversationId' }),
    __metadata("design:type", Object)
], ChatMember.prototype, "conversation", void 0);
__decorate([
    Column({ type: 'uuid' }),
    __metadata("design:type", String)
], ChatMember.prototype, "userId", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'userId' }),
    __metadata("design:type", Object)
], ChatMember.prototype, "user", void 0);
__decorate([
    CreateDateColumn({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], ChatMember.prototype, "joinedAt", void 0);
ChatMember = __decorate([
    Entity('chat_members')
], ChatMember);
export { ChatMember };
let ChatMessage = class ChatMessage {
    id;
    conversationId;
    conversation;
    senderId;
    sender;
    content;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], ChatMessage.prototype, "id", void 0);
__decorate([
    Column({ type: 'uuid' }),
    __metadata("design:type", String)
], ChatMessage.prototype, "conversationId", void 0);
__decorate([
    ManyToOne(() => ChatConversation, { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'conversationId' }),
    __metadata("design:type", Object)
], ChatMessage.prototype, "conversation", void 0);
__decorate([
    Column({ type: 'uuid' }),
    __metadata("design:type", String)
], ChatMessage.prototype, "senderId", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'senderId' }),
    __metadata("design:type", Object)
], ChatMessage.prototype, "sender", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], ChatMessage.prototype, "content", void 0);
__decorate([
    CreateDateColumn({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], ChatMessage.prototype, "createdAt", void 0);
ChatMessage = __decorate([
    Entity('chat_messages')
], ChatMessage);
export { ChatMessage };
//# sourceMappingURL=chat.entity.js.map