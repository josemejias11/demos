// Site-specific Playwright configuration for jobsity.com
// To use this config, run: npx playwright test --config=tests/jobsity-com/playwright.config.ts
import { defineConfig } from '@playwright/test';
import { siteConfig } from './site.config';

export default defineConfig({
  // Run only this site's E2E tests
  testDir: './e2e',
  timeout: 8000,
  expect: {
    timeout: 3000,
  },
  fullyParallel: false,
  retries: 1,
  workers: 2,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'test-results/html' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: 'https://www.jobsity.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    actionTimeout: 4000,
    navigationTimeout: 8000,
  },
  // Global setup initializes telemetry file and shared hooks
  globalSetup: './setup/global.setup.ts',
  projects: [
    {
      name: 'chromium',
      use: {
        channel: 'chrome',
        // generic-specific optimizations
        
      },
    },
  ],
  outputDir: 'test-results/artifacts',
});
