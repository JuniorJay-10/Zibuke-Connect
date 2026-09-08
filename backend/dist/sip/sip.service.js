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
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { User } from '../users/user.entity.js';
const EXTENSION_RANGE_START = 2000;
const EXTENSION_RANGE_END = 2019;
const SIP_DEMO_PASSWORD = process.env.SIP_DEMO_PASSWORD ?? 'ZibukeSip2026!';
let SipService = class SipService {
    users;
    constructor(users) {
        this.users = users;
    }
    async getConfigForUser(userId) {
        const user = await this.users.findOne({ where: { id: userId } });
        if (!user)
            throw new NotFoundException('User not found');
        if (!user.sipExtension) {
            user.sipExtension = await this.assignExtension();
            await this.users.save(user);
        }
        return {
            extension: user.sipExtension,
            password: SIP_DEMO_PASSWORD,
        };
    }
    async assignExtension() {
        const assigned = await this.users.find({
            where: { sipExtension: Not(IsNull()) },
            select: { sipExtension: true },
        });
        const used = new Set(assigned.map((u) => u.sipExtension));
        for (let ext = EXTENSION_RANGE_START; ext <= EXTENSION_RANGE_END; ext++) {
            const candidate = String(ext);
            if (!used.has(candidate))
                return candidate;
        }
        throw new Error('No browser SIP extensions available (2000-2019 are all in use)');
    }
};
SipService = __decorate([
    Injectable(),
    __param(0, InjectRepository(User)),
    __metadata("design:paramtypes", [Repository])
], SipService);
export { SipService };
//# sourceMappingURL=sip.service.js.map