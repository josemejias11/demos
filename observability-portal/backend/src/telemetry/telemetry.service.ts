import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface TelemetryLog {
  timestamp: string;
  siteName: string;
  eventType: string;
  url: string;
  message: string;
  details?: any;
}

@Injectable()
export class TelemetryService {
  private readonly ROOT_DIR: string;
  private readonly LOG_FILE: string;

  constructor(private configService: ConfigService) {
    this.ROOT_DIR = this.configService.get<string>('PLAYWRIGHT_RESULTS_DIR') || path.resolve(__dirname, '../../../../');
    this.LOG_FILE = path.join(this.ROOT_DIR, 'test-results', 'telemetry.jsonl');
  }

  getTelemetryLogs(): TelemetryLog[] {
    if (!fs.existsSync(this.LOG_FILE)) {
      return [];
    }

    try {
      const content = fs.readFileSync(this.LOG_FILE, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim() !== '');
      return lines.map(line => JSON.parse(line)).reverse(); // Newest first
    } catch (err) {
      console.error('Failed to parse telemetry logs:', err);
      return [];
    }
  }
}
