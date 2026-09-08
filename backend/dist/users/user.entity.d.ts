import { type Relation } from 'typeorm';
import { Contact } from '../contacts/contact.entity.js';
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    displayName: string;
    emailVerified: boolean;
    sipExtension: string;
    contacts: Relation<Contact>[];
}
