import { Repository } from 'typeorm';
import { User } from '../users/user.entity.js';
export declare class SipService {
    private readonly users;
    constructor(users: Repository<User>);
    getConfigForUser(userId: string): Promise<{
        extension: string;
        password: string;
    }>;
    private assignExtension;
}
