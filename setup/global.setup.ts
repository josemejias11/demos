import { FullConfig } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Page, ConsoleMessage, Response, Request } from '@playwright/test';

/**
 * Global setup with observability guards
 * Monitors console errors and HTTP 5xx responses
 * Emits to telemetry for KB learning
 */

interface TelemetryEvent {
  timestamp: string;
  siteName: string;
  eventType: 'console_error' | 'http_error' | 'network_failure';
  url: string;
  message: string;
  details?: unknown;
}

async function globalSetup(_config: FullConfig) {
  const telemetryPath = path.join(process.cwd(), 'discovery-results', 'automation-telemetry.jsonl');
  const telemetryDir = path.dirname(telemetryPath);

  if (!fs.existsSync(telemetryDir)) {
    fs.mkdirSync(telemetryDir, { recursive: true });
  }

  // Initialize telemetry file if not exists
  if (!fs.existsSync(telemetryPath)) {
    fs.writeFileSync(telemetryPath, '');
  }

  console.log(`\n🔍 Observability: Telemetry will be written to ${telemetryPath}\n`);
}

/**
 * Setup page guards for observability
 * Call this in test.beforeEach() to monitor console and network
 */
export async function setupPageGuards(page: Page, testName: string) {
  const telemetryPath = path.join(process.cwd(), 'discovery-results', 'automation-telemetry.jsonl');

  const emitTelemetry = (event: TelemetryEvent) => {
    try {
      fs.appendFileSync(telemetryPath, JSON.stringify(event) + '\n');
    } catch (error) {
      console.error('Failed to write telemetry:', error);
    }
  };

  // Monitor console errors
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      emitTelemetry({
        timestamp: new Date().toISOString(),
        siteName: 'jbs.dev',
        eventType: 'console_error',
        url: page.url(),
        message: msg.text(),
        details: { test: testName },
      });
    }
  });

  // Monitor HTTP 5xx responses
  page.on('response', (response: Response) => {
    if (response.status() >= 500) {
      emitTelemetry({
        timestamp: new Date().toISOString(),
        siteName: 'jbs.dev',
        eventType: 'http_error',
        url: page.url(),
        message: `HTTP ${response.status()} on ${response.url()}`,
        details: {
          test: testName,
          status: response.status(),
          resourceUrl: response.url(),
        },
      });
    }
  });

  // Monitor network failures
  page.on('requestfailed', (request: Request) => {
    emitTelemetry({
      timestamp: new Date().toISOString(),
      siteName: 'jbs.dev',
      eventType: 'network_failure',
      url: page.url(),
      message: `Failed to load: ${request.url()}`,
      details: {
        test: testName,
        failure: request.failure()?.errorText,
      },
    });
  });
}

export default globalSetup;
