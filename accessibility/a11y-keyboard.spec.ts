import { test, expect } from '@playwright/test';
import { setupPageGuards } from '../setup/global.setup.js';

test.describe('jobsity.com Accessibility - Keyboard and Alt Text', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await setupPageGuards(page, testInfo.title);
    await page.goto('https://www.jobsity.com');
  });

  test('All images have alt text or aria-label', async ({ page }) => {
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      const role = await img.getAttribute('role');
      expect(
        alt !== null || ariaLabel !== null || role === 'presentation',
        `Image without alt text: ${await img.getAttribute('src')}`
      ).toBeTruthy();
    }
  });

  test('Main navigation is keyboard operable', async ({ page }) => {
    const nav = page.locator('nav, .navigation, .main-nav, .navbar').first();
    await expect(nav).toBeVisible();
    // Try to focus first link in nav
    const firstLink = nav.locator('a').first();
    await firstLink.focus();
    const isFocused = await firstLink.evaluate(el => el === document.activeElement);
    expect(isFocused).toBeTruthy();
  });
});
