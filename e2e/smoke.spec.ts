import { test, expect } from '@playwright/test';
import { TargetSitePage } from '../pageObjects/TargetSitePage';
import { setupPageGuards } from '../setup/global.setup';

test.describe('Demo Site Smoke Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await setupPageGuards(page, testInfo.title);
  });

  test('Homepage loads successfully', async ({ page }) => {
    const targetSitePage = new TargetSitePage(page);

    await targetSitePage.navigate();

    await expect(page).toHaveURL(/example\.com/);
    await expect(page).toHaveTitle(/.+/);
  });

  test('Navigation menu is accessible', async ({ page }) => {
    const targetSitePage = new TargetSitePage(page);

    await targetSitePage.navigate();

    // Target uses header landmark (banner) for navigation — assert it is visible
    await expect(page.locator('header').first()).toBeVisible();
    // Verify nav items are present (menuitem elements within the nav list)
    await expect(page.locator('[role="menuitem"]').first()).toBeVisible();
  });
});
