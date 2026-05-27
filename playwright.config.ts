// Site-specific Playwright configuration for moodys.com
// To use this config, run: npx playwright test --config=tests/moodys-com/playwright.config.ts
import { defineConfig } from '@playwright/test';
import { siteConfig } from './site.config';

export default defineConfig({
  testDir: '.',
  testMatch: ['e2e/**/*.spec.ts', 'accessibility/**/*.spec.ts', 'api/**/*.spec.ts'],
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'always', outputFolder: 'test-results/html' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: 'https://www.moodys.com/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    actionTimeout: 5000,
    navigationTimeout: 15000,
    launchOptions: {
      args: ['--no-sandbox']
    }
  },
  // Global setup initializes telemetry file and shared hooks
  globalSetup: './setup/global.setup.ts',
  projects: [
    {
      name: 'chromium',
      use: {
      },
    },
  ],
  outputDir: 'test-results/artifacts',
});
