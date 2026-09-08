import { type Relation } from 'typeorm';
import { User } from '../users/user.entity.js';
export declare class Contact {
    id: string;
    name: string;
    email: string;
    extension: string;
    owner: Relation<User>;
    ownerId: string;
}
