import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { Contact } from './contact.entity.js';
import { ContactsController } from './contacts.controller.js';
import { ContactsService } from './contacts.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contact]),
    // We need AuthModule here because JwtAuthGuard (used in
    // ContactsController) depends on the passport setup AuthModule
    // exports. This is exactly why AuthModule exported PassportModule
    // earlier — so other modules can reuse it instead of reconfiguring
    // JWT handling from scratch.
    AuthModule,
  ],
  controllers: [ContactsController],
  providers: [ContactsService],
})

export class ContactsModule {}