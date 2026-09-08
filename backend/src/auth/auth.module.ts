import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './jwt.strategy.js';

@Module({
  imports: [
    // Makes the User repository injectable within this module (that's
    // what @InjectRepository(User) in auth.service.ts is pulling from).
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-only-secret-change-me',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  // Exporting AuthService and PassportModule means OTHER modules (e.g.
  // ContactsModule, to protect its routes) can use JwtAuthGuard without
  // re-declaring all of this setup themselves.
  exports: [AuthService, PassportModule],
})
export class AuthModule {}