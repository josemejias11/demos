import { TelemetryService } from './telemetry.service';
import type { TelemetryLog } from './telemetry.service';
export declare class TelemetryController {
    private readonly telemetryService;
    constructor(telemetryService: TelemetryService);
    getTelemetryLogs(): TelemetryLog[];
}
