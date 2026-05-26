import { test, expect } from '@playwright/test';
import { MoodysComPage } from '../pageObjects/MoodysComPage';
import { setupPageGuards } from '../setup/global.setup';

test.describe('moodys.com Smoke Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await setupPageGuards(page, testInfo.title);
  });

  test('Homepage loads successfully', async ({ page }) => {
    const moodysComPage = new MoodysComPage(page);

    await moodysComPage.navigate();

    await expect(page).toHaveURL(/moodys\.com/);
    await expect(page).toHaveTitle(/.+/);
  });

  test('Navigation menu is accessible', async ({ page }) => {
    const moodysComPage = new MoodysComPage(page);

    await moodysComPage.navigate();

    // Moodys uses header landmark (banner) for navigation — assert it is visible
    await expect(page.locator('header').first()).toBeVisible();
    // Verify nav items are present (menuitem elements within the nav list)
    await expect(page.locator('[role="menuitem"]').first()).toBeVisible();
  });
});
