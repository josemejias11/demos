// Site-specific Playwright configuration for msd.com
// To use this config, run: npx playwright test --config=tests/msd-com/playwright.config.ts
import { defineConfig } from '@playwright/test';
import { siteConfig } from './site.config';

export default defineConfig({
  // Run only this site's E2E tests
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
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
    baseURL: 'https://www.msd.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
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
