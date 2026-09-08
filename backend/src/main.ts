import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // The React frontend runs on a different origin (different port/container),
  // so the browser blocks requests to this API unless we explicitly allow it.
  app.enableCors();

  // This is what actually makes the @IsEmail(), @MinLength() etc.
  // decorators on our DTOs (RegisterDto, LoginDto, CreateContactDto) do
  // anything. Without this line, those decorators are just inert
  // metadata — NestJS wouldn't check them on incoming requests at all.
  // whitelist strips any request fields NOT declared on the DTO, so a
  // client can't sneak extra fields (e.g. isAdmin: true) into a request.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Every route in this API is reachable under /api/... — e.g. /api/hello.
  // Keeping a prefix like this makes it obvious (to you and to Kamailio/nginx
  // later) which requests are "our app data" vs telecom/media traffic.
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();