import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity.js';
import { ChatController } from './chat.controller.js';
import { ChatConversation, ChatMember, ChatMessage } from './chat.entity.js';
import { ChatService } from './chat.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ChatConversation, ChatMember, ChatMessage]),
    // ChatController uses @UseGuards(JwtAuthGuard) — that guard needs
    // AuthModule's PassportModule setup to resolve, same reason
    // ContactsModule needs it.
    AuthModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
