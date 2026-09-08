import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { SipService } from './sip.service.js';

@UseGuards(JwtAuthGuard)
@Controller('sip')
export class SipController {
  constructor(private readonly sipService: SipService) {}

  // The frontend calls this right after login (see lib/sipClient.ts) to
  // get the extension/password it needs to register the in-browser
  // softphone with FreeSWITCH over WebSocket.
  @Get('config')
  getConfig(@Req() req: Request) {
    const userId = (req.user as { userId: string }).userId;
    return this.sipService.getConfigForUser(userId);
  }
}
