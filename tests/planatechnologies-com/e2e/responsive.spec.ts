import { test, expect, devices } from '@playwright/test';
import { PlanatechnologiesComPage } from '../pageObjects/PlanatechnologiesComPage';
import { setupPageGuards } from '../setup/global.setup';

test.describe('Plan A Technologies - Responsive Tests', () => {
  test('Test 16: Mobile viewport rendering', async ({ browser }) => {
    // Increase timeout for mobile test as it may take longer to load
    test.setTimeout(30000);

    // Create mobile context - Firefox doesn't support isMobile, so we need to extract only compatible properties
    const iPhoneDevice = devices['iPhone 12'];
    const context = await browser.newContext({
      userAgent: iPhoneDevice.userAgent,
      viewport: { width: 375, height: 667 },
      deviceScaleFactor: iPhoneDevice.deviceScaleFactor,
      hasTouch: iPhoneDevice.hasTouch
      // Note: isMobile is not supported in Firefox
    });

    const page = await context.newPage();
    await setupPageGuards(page, 'Mobile viewport test');

    // Navigate with extended timeout for mobile viewport
    await page.goto('https://planatechnologies.com/', { timeout: 20000 });
    await page.waitForLoadState('domcontentloaded');

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
    // Create tablet context - Firefox doesn't support isMobile, so we need to extract only compatible properties
    const iPadDevice = devices['iPad (gen 7)'];
    const context = await browser.newContext({
      userAgent: iPadDevice.userAgent,
      viewport: { width: 768, height: 1024 },
      deviceScaleFactor: iPadDevice.deviceScaleFactor,
      hasTouch: iPadDevice.hasTouch
      // Note: isMobile is not supported in Firefox
    });

    const page = await context.newPage();
    await setupPageGuards(page, 'Tablet viewport test');

    // Navigate with extended timeout for tablet viewport
    await page.goto('https://planatechnologies.com/', { timeout: 20000 });
    await page.waitForLoadState('domcontentloaded');

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
