import { ConfigService } from '@nestjs/config';
import type { Response, Request } from 'express';
export declare class RunnerService {
    private configService;
    private readonly ROOT_DIR;
    constructor(configService: ConfigService);
    runTest(suite: string, targetEnv: string, headed: string, browser: string, workers: string, req: Request, res: Response): void;
    streamVideo(videoPath: string, res: Response): void;
    resolveSimulator(intent: string): {
        success: boolean;
        data: {
            intent: string;
            resolvedSelector: string;
            confidenceScore: number;
            recordingPath: string;
        };
    };
    showReport(): {
        success: boolean;
    };
    openUiMode(): {
        success: boolean;
    };
}
