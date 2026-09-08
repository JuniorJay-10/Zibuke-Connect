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
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { SipService } from './sip.service.js';
let SipController = class SipController {
    sipService;
    constructor(sipService) {
        this.sipService = sipService;
    }
    getConfig(req) {
        const userId = req.user.userId;
        return this.sipService.getConfigForUser(userId);
    }
};
__decorate([
    Get('config'),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SipController.prototype, "getConfig", null);
SipController = __decorate([
    UseGuards(JwtAuthGuard),
    Controller('sip'),
    __metadata("design:paramtypes", [SipService])
], SipController);
export { SipController };
//# sourceMappingURL=sip.controller.js.map