import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

// @Controller() with no path means this controller's routes hang off the
// global prefix directly: combined with app.setGlobalPrefix('api') in
// main.ts, @Get('hello') below becomes GET /api/hello.
@Controller()
export class AppController {
  // NestJS's dependency injection: we don't create an AppService ourselves,
  // Nest creates one and hands it to us. This is what makes services easy
  // to swap/mock later (e.g. in tests) without touching this controller.
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getHello(): { status: string; message: string } {
    return this.appService.getHealthMessage();
  }
}
