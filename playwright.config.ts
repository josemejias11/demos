// Site-specific Playwright configuration for planatechnologies.com
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Run only this site's E2E tests
  testDir: './tests/planatechnologies-com/e2e',
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
    baseURL: 'https://planatechnologies.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    actionTimeout: 4000,
    navigationTimeout: 8000,
  },
  // Global setup initializes telemetry file and shared hooks
  globalSetup: './tests/planatechnologies-com/setup/global.setup.ts',
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],
  outputDir: 'test-results/artifacts',
});
