import { ConfigService } from '@nestjs/config';
export interface KbEntry {
    timestamp: string;
    intent: string;
    selector: string;
    confidence: string;
}
export interface PendingApproval {
    id: string;
    testName: string;
    intent: string;
    oldSelector: string;
    newSelector: string;
    confidence: number;
    timestamp: string;
}
export declare class KbService {
    private configService;
    private readonly ROOT_DIR;
    private readonly KB_FILE;
    private pendingApprovals;
    constructor(configService: ConfigService);
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
