import { Repository } from 'typeorm';
import { Contact } from './contact.entity.js';
import { CreateContactDto } from './dto.js';
export declare class ContactsService {
    private readonly contacts;
    constructor(contacts: Repository<Contact>);
    findAllForUser(ownerId: string): Promise<Contact[]>;
    create(ownerId: string, dto: CreateContactDto): Promise<Contact>;
}
