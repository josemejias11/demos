import { KbService } from './kb.service';
import type { KbEntry, PendingApproval } from './kb.service';
export declare class KbController {
    private readonly kbService;
    constructor(kbService: KbService);
    getKbEntries(): KbEntry[];
    getPendingApprovals(): PendingApproval[];
    approveSelector(id: string): {
        success: boolean;
        message: string;
    };
    rejectSelector(id: string): {
        success: boolean;
        message: string;
    };
}
