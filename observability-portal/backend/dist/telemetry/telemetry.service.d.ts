import { ConfigService } from '@nestjs/config';
export interface TelemetryLog {
    timestamp: string;
    siteName: string;
    eventType: string;
    url: string;
    message: string;
    details?: any;
}
export declare class TelemetryService {
    private configService;
    private readonly ROOT_DIR;
    private readonly LOG_FILE;
    constructor(configService: ConfigService);
    getTelemetryLogs(): TelemetryLog[];
}
