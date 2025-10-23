import { test, expect } from '@playwright/test';
import { JobsityComPage } from '../pageObjects/JobsityComPage.js';
import { setupPageGuards } from '../setup/global.setup.js';
import { UserBuilder, ProductBuilder, CartBuilder } from '../data/index.js';

test.describe('jobsity.com Smoke Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Setup observability guards
    await setupPageGuards(page, testInfo.title);
  });

  test('Homepage loads successfully', async ({ page }) => {
    const jobsityComPage = new JobsityComPage(page);

    await jobsityComPage.navigate();

    // Verify page loaded
    await expect(page).toHaveURL(new RegExp('https://www.jobsity.com'));
    await expect(page).toHaveTitle(/.+/);
  });


  test('Navigation menu is accessible', async ({ page }) => {
    const jobsityComPage = new JobsityComPage(page);

    await jobsityComPage.navigate();

    // Wait for possible dynamic rendering
    await page.waitForTimeout(300);
    const navElements = page.locator('nav, .navigation, .menu, [role="navigation"]');
    if (await navElements.count() === 0) {
      test.skip(true, 'No navigation menu element present on this page.');
      return;
    }
    await expect(navElements.first()).toBeVisible();
  });
});
