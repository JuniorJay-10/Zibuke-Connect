import type { Request } from 'express';
import { ContactsService } from './contacts.service.js';
import { CreateContactDto } from './dto.js';
export declare class ContactsController {
    private readonly contactsService;
    constructor(contactsService: ContactsService);
    findAll(req: Request): Promise<import("./contact.entity.js").Contact[]>;
    create(req: Request, dto: CreateContactDto): Promise<import("./contact.entity.js").Contact>;
}
