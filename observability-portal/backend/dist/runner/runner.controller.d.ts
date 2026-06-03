import type { Response, Request } from 'express';
import { RunnerService } from './runner.service';
export declare class RunnerController {
    private readonly runnerService;
    constructor(runnerService: RunnerService);
    runTest(suite: string | undefined, targetEnv: string | undefined, headed: string | undefined, browser: string | undefined, workers: string | undefined, req: Request, res: Response): void;
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
