// Site-specific Playwright configuration for jbs.dev
// To use this config, run: npx playwright test --config=tests/jbs-dev/playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Run E2E and API tests for this site
  testDir: './',
  testMatch: ['**/*.spec.ts'],
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
    baseURL: 'https://www.jbs.dev',
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
    {
      name: 'firefox',
      use: {
        browserName: 'firefox',
        // Firefox-specific optimizations

      },
    },
    {
      name: 'webkit',
      use: {
        browserName: 'webkit',
        // WebKit/Safari-specific optimizations

      },
    },
  ],
  outputDir: 'test-results/artifacts',
});
