import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // This is a "service" in NestJS terms: it holds business logic, kept
  // separate from the controller (which only handles HTTP request/response).
  // Right now it's trivial, but this is where real logic (e.g. creating a
  // meeting, checking a contact) will live once we build those features.
  getHealthMessage(): { status: string; message: string } {
    return {
      status: 'ok',
      message: 'Zibuke UC API is running',
    };
  }
}
