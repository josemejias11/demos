import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testIgnore: '**/*.test.ts',
  timeout: 60 * 1000,
  expect: {
    timeout: 10000
  },
  fullyParallel: false,
  // Retries: enable 1 retry on CI for resiliency, 0 locally
  retries: process.env.CI ? 1 : 0,
  workers: 3,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'test-results/html' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['allure-playwright'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://www.experian.com', // default if not set in env
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: process.env.HEADLESS ? /^(true|1|yes)$/i.test(process.env.HEADLESS) : false,
  },
  projects: [
    // Original projects for framework tests
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        headless: process.env.HEADLESS ? /^(true|1|yes)$/i.test(process.env.HEADLESS) : false,
        launchOptions: {
          args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
        },
      },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      // Exclude @ci-tagged tests on mobile-chrome to avoid potential flakiness on some sites
      grepInvert: /@ci/,
      use: { ...devices['Pixel 5'] },
    },
  ],
  outputDir: 'test-results/artifacts',
});
