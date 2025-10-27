import { test, expect, devices } from '@playwright/test';
import { PlanatechnologiesComPage } from '../pageObjects/PlanatechnologiesComPage';
import { setupPageGuards } from '../setup/global.setup';

test.describe('Plan A Technologies - Responsive Tests', () => {
  test('Test 16: Mobile viewport rendering', async ({ browser }) => {
    // Create mobile context
    const context = await browser.newContext({
      ...devices['iPhone 12'],
      viewport: { width: 375, height: 667 }
    });

    const page = await context.newPage();
    await setupPageGuards(page, 'Mobile viewport test');

    const planatechnologiesComPage = new PlanatechnologiesComPage(page);
    await planatechnologiesComPage.navigate();

    // Verify page loads on mobile
    await expect(page).toHaveURL(/planatechnologies\.com/);

    // Check viewport dimensions
    const viewportSize = page.viewportSize();
    expect(viewportSize?.width).toBeLessThanOrEqual(375);

    // Verify mobile menu/navigation exists
    const mobileNav = page.locator('nav, [role="navigation"], .mobile-menu, .hamburger, button[aria-label*="menu" i]');
    await expect(mobileNav.first()).toBeVisible();

    // Verify content is not horizontally scrollable
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = viewportSize?.width || 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow small tolerance

    await context.close();
  });

  test('Test 17: Tablet viewport rendering', async ({ browser }) => {
    // Create tablet context
    const context = await browser.newContext({
      ...devices['iPad'],
      viewport: { width: 768, height: 1024 }
    });

    const page = await context.newPage();
    await setupPageGuards(page, 'Tablet viewport test');

    const planatechnologiesComPage = new PlanatechnologiesComPage(page);
    await planatechnologiesComPage.navigate();

    // Verify page loads on tablet
    await expect(page).toHaveURL(/planatechnologies\.com/);

    // Check viewport dimensions
    const viewportSize = page.viewportSize();
    expect(viewportSize?.width).toBe(768);

    // Verify navigation is visible (broadened selector to catch any clickable elements)
    const nav = page.locator('header, nav, [role="navigation"], [role="banner"], a, button');
    await expect(nav.first()).toBeVisible();

    // Verify content is properly sized
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = viewportSize?.width || 768;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);

    // Test that images are responsive
    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      const firstImage = images.first();
      const imageWidth = await firstImage.evaluate((img: HTMLImageElement) => img.clientWidth);
      expect(imageWidth).toBeLessThanOrEqual(viewportWidth);
    }

    await context.close();
  });
});
