import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testIgnore: '**/*.test.ts',
  timeout: 60 * 1000,
  expect: {
    timeout: 10000,
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
  ],
  use: {
    baseURL: 'https://www.bristlecone.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: process.env.HEADLESS ? /^(true|1|yes)$/i.test(process.env.HEADLESS) : false,
  },
  projects: [
    // Bristlecone Testing Suite
    {
      name: 'bristlecone-chrome',
      testMatch: 'tests/bristlecone/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://www.bristlecone.com',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        headless: false,
        launchOptions: {
          args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
        },
      },
    },
    {
      name: 'bristlecone-mobile',
      testMatch: 'tests/bristlecone/mobile/**/*.spec.ts',
      use: {
        ...devices['iPhone 12'],
        baseURL: 'https://www.bristlecone.com',
      },
    },
    // Original projects for framework tests
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        headless: false,
        launchOptions: {
          args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
        },
      },
    },
    {
      name: 'chromium-debug',
      use: {
        ...devices['Desktop Chrome'],
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        headless: false,
        trace: 'on',
        screenshot: 'on',
        video: 'on',
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
    {
      name: 'mobile-safari',
  grepInvert: /@ci/,
  use: { ...devices['iPhone 12'] },
    },
  ],
  outputDir: 'test-results/artifacts',
  // Tip: In CI, select tagged suites, e.g.:
  //   npx playwright test --grep "@ci"
  // Or exclude optional/flaky:
  //   npx playwright test --grep-invert "@optional|@flaky"
});
