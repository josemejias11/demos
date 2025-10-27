import { test, expect } from '@playwright/test';
import { PlanatechnologiesComPage } from '../pageObjects/PlanatechnologiesComPage';
import { setupPageGuards } from '../setup/global.setup';

test.describe('Plan A Technologies - Navigation Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await setupPageGuards(page, testInfo.title);
  });

  test('Test 2: About Us navigation', async ({ page }) => {
    const planatechnologiesComPage = new PlanatechnologiesComPage(page);

    await planatechnologiesComPage.navigate();

    // Find and click About Us link
    const aboutLink = page.locator('a').filter({ hasText: /about\s*us|about$/i }).first();
    await aboutLink.click();

    // Verify navigation occurred
    await expect(page).toHaveURL(/about/i);

    // Verify About page content
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });

  test('Test 3: Careers page load', async ({ page }) => {
    const planatechnologiesComPage = new PlanatechnologiesComPage(page);

    await planatechnologiesComPage.navigate();

    // Find and click Careers link
    const careersLink = page.locator('a').filter({ hasText: /careers?/i }).first();
    await careersLink.click();

    // Verify navigation occurred
    await expect(page).toHaveURL(/career/i);

    // Verify Careers page has content
    const hasJobContent = await page.locator('body').textContent();
    expect(hasJobContent).toBeTruthy();
  });

  test('Test 4: Blog/News navigation', async ({ page }) => {
    const planatechnologiesComPage = new PlanatechnologiesComPage(page);

    await planatechnologiesComPage.navigate();

    // Try to find Blog or News link
    const blogLink = page.locator('a').filter({ hasText: /blog|news/i }).first();
    const linkCount = await blogLink.count();

    if (linkCount > 0) {
      await blogLink.click();

      // Verify navigation occurred
      await expect(page).toHaveURL(/blog|news/i);

      // Verify page has content
      const content = await page.locator('body').textContent();
      expect(content).toBeTruthy();
    } else {
      // Skip test if Blog/News section doesn't exist
      test.skip();
    }
  });

  test('Test 5: Footer navigation', async ({ page }) => {
    const planatechnologiesComPage = new PlanatechnologiesComPage(page);

    await planatechnologiesComPage.navigate();

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Verify footer exists
    const footer = page.locator('footer, .footer, [role="contentinfo"]').first();
    await expect(footer).toBeVisible();

    // Check for footer links (Privacy, Terms, Cookies)
    const footerLinks = footer.locator('a');
    const linkCount = await footerLinks.count();

    expect(linkCount).toBeGreaterThan(0);

    // Try to find and click Privacy link
    const privacyLink = footer.locator('a').filter({ hasText: /privacy/i }).first();
    const privacyExists = await privacyLink.count() > 0;

    if (privacyExists) {
      await privacyLink.click();
      await expect(page).toHaveURL(/privacy/i);
    }
  });
});
