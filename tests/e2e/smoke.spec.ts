import { test, expect } from '@playwright/test';
import { JbsDevPage } from '../pageObjects/JbsDevPage';
import { setupPageGuards } from '../../setup/global.setup';
import { siteConfig } from '../../site.config';

test.describe('jbs.dev Smoke Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Setup observability guards
    await setupPageGuards(page, testInfo.title);
  });

  test('Homepage loads successfully', async ({ page }) => {
    const jbsDevPage = new JbsDevPage(page);

    await jbsDevPage.navigate();

    // Verify page loaded
    await expect(page).toHaveURL(new RegExp(siteConfig.baseURL));
    await expect(page).toHaveTitle(/.+/);
  });


  test('Navigation menu is accessible', async ({ page }) => {
    const jbsDevPage = new JbsDevPage(page);

    await jbsDevPage.navigate();

    // Check for navigation elements using configured selector
    const navElements = page.locator(siteConfig.selectors.navigationMenu as string);
    await expect(navElements.first()).toBeVisible();
  });
});
