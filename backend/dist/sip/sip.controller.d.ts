import type { Request } from 'express';
import { SipService } from './sip.service.js';
export declare class SipController {
    private readonly sipService;
    constructor(sipService: SipService);
    getConfig(req: Request): Promise<{
        extension: string;
        password: string;
    }>;
}
