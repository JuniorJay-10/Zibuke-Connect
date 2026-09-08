var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { User } from './users/user.entity.js';
import { Contact } from './contacts/contact.entity.js';
import { AuthModule } from './auth/auth.module.js';
import { ContactsModule } from './contacts/contacts.module.js';
import { ChatConversation, ChatMember, ChatMessage } from './chat/chat.entity.js';
import { ChatModule } from './chat/chat.module.js';
import { SipModule } from './sip/sip.module.js';
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [
            ConfigModule.forRoot({ isGlobal: true }),
            TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST ?? 'postgres',
                port: Number(process.env.DB_PORT ?? 5432),
                username: process.env.DB_USER ?? 'zibuke',
                password: process.env.DB_PASSWORD ?? 'zibuke_dev_password',
                database: process.env.DB_NAME ?? 'zibuke',
                entities: [User, Contact, ChatConversation, ChatMember, ChatMessage],
                synchronize: true,
            }),
            AuthModule,
            ContactsModule,
            ChatModule,
            SipModule,
        ],
        controllers: [AppController],
        providers: [AppService],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map