import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ContactsService } from './contacts.service.js';
import { CreateContactDto } from './dto.js';

// This guard applies to EVERY route in this controller — someone without
// a valid token gets a 401 before any of the methods below even run.
@UseGuards(JwtAuthGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  findAll(@Req() req: Request) {
    // JwtStrategy's validate() (see jwt.strategy.ts) put { userId, email }
    // onto the request as `user` — this is how a protected route knows
    // WHO is asking, straight from their verified token.
    const userId = (req.user as { userId: string }).userId;
    return this.contactsService.findAllForUser(userId);
  }

  @Post()
  create(@Req() req: Request, @Body() dto: CreateContactDto) {
    const userId = (req.user as { userId: string }).userId;
    return this.contactsService.create(userId, dto);
  }
}