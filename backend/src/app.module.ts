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

@Module({
  imports: [
    // Loads environment variables (from docker-compose.yml's environment:
    // block) and makes them available app-wide via process.env.
    ConfigModule.forRoot({ isGlobal: true }),

    // This is the actual database connection. TypeORM reads these values
    // and connects to the Postgres container over the network Docker
    // Compose sets up — "postgres" below is the service name, resolved
    // the same way "freeswitch" was inside kamailio.cfg on Day 2.
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'postgres',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'zibuke',
      password: process.env.DB_PASSWORD ?? 'zibuke_dev_password',
      database: process.env.DB_NAME ?? 'zibuke',
      entities: [User, Contact, ChatConversation, ChatMember, ChatMessage],
      // synchronize auto-creates/updates tables to match our entity
      // classes. Genuinely useful for fast iteration during development —
      // never use this in a real production deployment, where you'd use
      // proper migrations instead so schema changes are reviewed and
      // reversible.
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
export class AppModule {}