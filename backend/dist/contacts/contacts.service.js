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
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity.js';
let ContactsService = class ContactsService {
    contacts;
    constructor(contacts) {
        this.contacts = contacts;
    }
    findAllForUser(ownerId) {
        return this.contacts.find({ where: { ownerId }, order: { name: 'ASC' } });
    }
    async create(ownerId, dto) {
        const contact = this.contacts.create({ ...dto, ownerId });
        return this.contacts.save(contact);
    }
};
ContactsService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Contact)),
    __metadata("design:paramtypes", [Repository])
], ContactsService);
export { ContactsService };
//# sourceMappingURL=contacts.service.js.map