var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity.js';
const SALT_ROUNDS = 10;
let AuthService = class AuthService {
    users;
    jwt;
    constructor(users, jwt) {
        this.users = users;
        this.jwt = jwt;
    }
    async register(dto) {
        const existing = await this.users.findOne({ where: { email: dto.email } });
        if (existing) {
            throw new ConflictException('An account with this email already exists');
        }
        const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
        const user = this.users.create({
            email: dto.email,
            passwordHash,
            displayName: dto.displayName,
        });
        await this.users.save(user);
        return this.buildAuthResponse(user);
    }
    async login(dto) {
        const user = await this.users.findOne({ where: { email: dto.email } });
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }
        const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid email or password');
        }
        return this.buildAuthResponse(user);
    }
    buildAuthResponse(user) {
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
};
AuthService = __decorate([
    Injectable(),
    __param(0, InjectRepository(User)),
    __metadata("design:paramtypes", [Repository,
        JwtService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map