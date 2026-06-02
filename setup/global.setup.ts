import { type FullConfig, type Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const telemetryPath = path.resolve(__dirname, '..', 'discovery-results', 'automation-telemetry.jsonl');
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
  const telemetryPath = path.resolve(__dirname, '..', 'discovery-results', 'automation-telemetry.jsonl');

  const emitTelemetry = (event: TelemetryEvent) => {
    try {
      fs.appendFileSync(telemetryPath, JSON.stringify(event) + '\n');
    } catch (error) {
      console.error('Failed to write telemetry:', error);
    }
  };

  // Known analytics and tracking domains to block
  const BLOCKED_DOMAINS = [
    'marketo.net',
    'newrelic.com',
    'cloudflareinsights.com',
    'smetrics.moodys.com',
    'demdex.net',
    'googletagmanager.com',
    'mktoweb.com'
  ];

  // Intercept and abort third-party tracking scripts to improve speed and prevent fake analytics
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (BLOCKED_DOMAINS.some(domain => url.includes(domain))) {
      route.abort();
    } else {
      route.continue();
    }
  });

  // Monitor console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      emitTelemetry({
        timestamp: new Date().toISOString(),
        siteName: 'moodys.com',
        eventType: 'console_error',
        url: page.url(),
        message: msg.text(),
        details: { test: testName },
      });
    }
  });

  // Monitor HTTP 5xx responses
  page.on('response', (response) => {
    if (response.status() >= 500) {
      emitTelemetry({
        timestamp: new Date().toISOString(),
        siteName: 'moodys.com',
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
  page.on('requestfailed', (request) => {
    const url = request.url();
    
    // Ignore intentionally blocked domains
    if (BLOCKED_DOMAINS.some(domain => url.includes(domain))) {
      return;
    }

    emitTelemetry({
      timestamp: new Date().toISOString(),
      siteName: 'moodys.com',
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
