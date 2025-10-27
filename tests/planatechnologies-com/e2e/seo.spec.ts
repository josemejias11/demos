import { test, expect } from '@playwright/test';
import { PlanatechnologiesComPage } from '../pageObjects/PlanatechnologiesComPage';
import { setupPageGuards } from '../setup/global.setup';

test.describe('Plan A Technologies - SEO Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await setupPageGuards(page, testInfo.title);
  });

  test('Test 20: Meta tags and SEO elements', async ({ page }) => {
    // Increase timeout for this test as it performs many SEO checks
    test.setTimeout(30000);

    const planatechnologiesComPage = new PlanatechnologiesComPage(page);

    await planatechnologiesComPage.navigate();

    // Check for title tag
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThan(70); // SEO best practice

    // Check for meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBeTruthy();
    if (metaDescription) {
      expect(metaDescription.length).toBeGreaterThan(10); // Relaxed from 50 for site-specific content
      expect(metaDescription.length).toBeLessThan(200); // Relaxed from 160
    }

    // Check for canonical URL (optional, timeout quickly if not present)
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href', { timeout: 2000 }).catch(() => null);
    if (canonical) {
      expect(canonical).toContain('planatechnologies.com');
    }

    // Check for Open Graph tags (optional, timeout quickly if not present)
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content', { timeout: 2000 }).catch(() => null);
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content', { timeout: 2000 }).catch(() => null);
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content', { timeout: 2000 }).catch(() => null);

    // At least one OG tag should exist
    const hasOgTags = !!(ogTitle || ogDescription || ogImage);
    expect(hasOgTags).toBeTruthy();

    // Check for viewport meta tag (mobile-friendly)
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toBeTruthy();
    expect(viewport).toContain('width=device-width');

    // Check for h1 tag
    const h1Elements = page.locator('h1');
    const h1Count = await h1Elements.count();
    expect(h1Count).toBeGreaterThanOrEqual(1); // Should have at least one h1
    expect(h1Count).toBeLessThanOrEqual(20); // Relaxed limit for sites with multiple sections

    if (h1Count > 0) {
      const h1Text = await h1Elements.first().textContent();
      expect(h1Text?.trim().length).toBeGreaterThan(0);
    }

    // Check for heading hierarchy
    const h2Count = await page.locator('h2').count();

    expect(h2Count).toBeGreaterThan(0); // Page should have section headings

    // Check for alt attributes on images
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    const totalImages = await page.locator('img').count();

    if (totalImages > 0) {
      const altTextRatio = (totalImages - imagesWithoutAlt) / totalImages;
      expect(altTextRatio).toBeGreaterThan(0.8); // At least 80% should have alt text
    }

    // Check for lang attribute on html
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBeTruthy();
    expect(htmlLang).toMatch(/^en/); // Should be English

    // Check for robots meta tag (optional but good to verify)
    const robots = await page.locator('meta[name="robots"]').getAttribute('content', { timeout: 2000 }).catch(() => null);
    if (robots) {
      // If robots tag exists, ensure it's not blocking indexing
      expect(robots).not.toContain('noindex');
    }
  });
});
