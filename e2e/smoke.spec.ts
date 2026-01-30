import { test, expect } from '@playwright/test';
import { MsdComPage } from '../pageObjects/MsdComPage';

test.describe('msd.com Smoke Tests', () => {

  test('Homepage loads successfully', async ({ page }) => {
    const msdComPage = new MsdComPage(page);

    await msdComPage.navigate();

    // Verify page loaded
    await expect(page).toHaveURL(new RegExp('https://www.msd.com'));
    await expect(page).toHaveTitle(/.+/);
  });

  
  test('Navigation menu trigger is accessible', async ({ page }) => {
    const msdComPage = new MsdComPage(page);

    await msdComPage.navigate();

    // The nav is behind a hamburger menu; verify the Menu button is visible
    const menuTrigger = page.locator('button:has-text("Menu"), [aria-label*="menu" i], .menu-toggle').first();
    await expect(menuTrigger).toBeVisible();
  });

  test('Page returns 200 status', async ({ page }) => {
    const response = await page.goto('https://www.msd.com');
    expect(response?.status()).toBe(200);
  });

  test('Logo is visible in the header', async ({ page }) => {
    await page.goto('https://www.msd.com');
    const logo = page.locator('header img, header svg, a[aria-label*="home" i] img, a[aria-label*="MSD" i]').first();
    await expect(logo).toBeVisible();
  });

  test('Footer is present', async ({ page }) => {
    await page.goto('https://www.msd.com');
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
  });

  test('Footer contains copyright info', async ({ page }) => {
    await page.goto('https://www.msd.com');
    const footer = page.locator('footer');
    await expect(footer).toContainText(/©|copyright/i);
  });

  test('Search trigger is visible', async ({ page }) => {
    await page.goto('https://www.msd.com');
    const search = page.locator('button:has-text("Search"), a:has-text("Search"), [aria-label*="search" i]').first();
    await expect(search).toBeVisible();
  });

  test('No console errors on homepage', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('https://www.msd.com');
    await page.waitForLoadState('domcontentloaded');
    expect(errors.length).toBe(0);
  });

  test('No broken images on homepage', async ({ page }) => {
    await page.goto('https://www.msd.com');
    const images = await page.locator('img[src]:visible').all();
    for (const img of images) {
      const { complete, naturalWidth } = await img.evaluate((el: HTMLImageElement) => ({
        complete: el.complete,
        naturalWidth: el.naturalWidth,
      }));
      // Skip lazy-loaded images that haven't started loading yet
      if (!complete) continue;
      const src = await img.getAttribute('src');
      expect(naturalWidth, `Broken image: ${src}`).toBeGreaterThan(0);
    }
  });

  test('Page has meta description', async ({ page }) => {
    await page.goto('https://www.msd.com');
    const meta = page.locator('meta[name="description"]');
    const content = await meta.getAttribute('content');
    expect(content).toBeTruthy();
  });

  test('Page has a heading', async ({ page }) => {
    await page.goto('https://www.msd.com');
    const headings = await page.locator('h1, h2, h3').all();
    const anyVisible = await Promise.any(
      headings.map(h => h.isVisible().then(v => v ? true : Promise.reject()))
    ).catch(() => false);
    expect(anyVisible, 'At least one heading should be visible').toBe(true);
  });

  test('Main content area is present', async ({ page }) => {
    await page.goto('https://www.msd.com');
    const main = page.locator('main, [role="main"], .main-content, #content').first();
    await expect(main).toBeVisible();
  });

  test('Page loads within timeout', async ({ page }) => {
    const start = Date.now();
    await page.goto('https://www.msd.com', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(8000);
  });
});
