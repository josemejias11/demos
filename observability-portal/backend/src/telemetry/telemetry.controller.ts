import { Controller, Get } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import type { TelemetryLog } from './telemetry.service';

@Controller('api/telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Get()
  getTelemetryLogs(): TelemetryLog[] {
    return this.telemetryService.getTelemetryLogs();
  }
}
