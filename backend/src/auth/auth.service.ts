import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity.js';
import { LoginDto, RegisterDto } from './dto.js';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    // @InjectRepository gives us TypeORM's query interface for the User
    // table specifically — find, save, delete, etc. — without us writing
    // any SQL. This is dependency injection again, same pattern as
    // AppController asking for AppService back on Day 1.
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    // We hash the password here, in the service (business logic), not in
    // the controller — the controller shouldn't know or care HOW passwords
    // are secured, only that registration happened.
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = this.users.create({
      email: dto.email,
      passwordHash,
      displayName: dto.displayName,
    });
    await this.users.save(user);

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOne({ where: { email: dto.email } });

    // Deliberately vague error message on both "no such user" and "wrong
    // password" — a more specific message ("no account with that email")
    // would let an attacker discover which emails are registered.
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: User) {
    // The JWT's "payload" (sub = subject = user id) is what later requests
    // will be authenticated against — see jwt.strategy.ts.
    const token = this.jwt.sign({ sub: user.id, email: user.email });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
    };
  }
}