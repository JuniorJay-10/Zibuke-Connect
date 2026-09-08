import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { SipController } from './sip.controller.js';
import { SipService } from './sip.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    // SipController uses @UseGuards(JwtAuthGuard) — same reason
    // ContactsModule and ChatModule import this.
    AuthModule,
  ],
  controllers: [SipController],
  providers: [SipService],
})
export class SipModule {}
