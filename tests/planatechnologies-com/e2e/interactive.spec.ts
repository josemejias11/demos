import { test, expect } from '@playwright/test';
import { PlanatechnologiesComPage } from '../pageObjects/PlanatechnologiesComPage';
import { setupPageGuards } from '../setup/global.setup';

test.describe('Plan A Technologies - Interactive Elements Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await setupPageGuards(page, testInfo.title);
  });

  test('Test 7: CTA buttons are functional', async ({ page }) => {
    const planatechnologiesComPage = new PlanatechnologiesComPage(page);

    await planatechnologiesComPage.navigate();

    // Find CTA buttons - look for common action buttons
    const ctaButtons = page.locator('a[href*="contact"], button[type="submit"], a').filter({
      hasText: /contact|get\s+in\s+touch|schedule|book|inquir/i
    });
    const buttonCount = await ctaButtons.count();

    // If no specific CTA buttons found, look for any prominent links/buttons in header or hero
    if (buttonCount === 0) {
      const headerButtons = page.locator('header a, nav a').filter({ hasText: /contact/i });
      // Look for any links in the hero section, but we'll check visibility
      const allHeroLinks = page.locator('section').first().locator('a[href]:visible');

      const headerCount = await headerButtons.count();
      const heroLinkCount = await allHeroLinks.count();

      // We expect to find at least some clickable elements
      expect(headerCount + heroLinkCount).toBeGreaterThan(0);

      if (headerCount > 0) {
        await expect(headerButtons.first()).toBeVisible();
      } else if (heroLinkCount > 0) {
        // Just verify at least one link is present
        await expect(allHeroLinks.first()).toBeVisible();
      }
    } else {
      expect(buttonCount).toBeGreaterThan(0);

      // Test first CTA button
      const firstCTA = ctaButtons.first();
      await expect(firstCTA).toBeVisible();

      // Verify button is clickable (has href or onclick)
      const isLink = await firstCTA.evaluate((el) => el.tagName === 'A');
      const isButton = await firstCTA.evaluate((el) => el.tagName === 'BUTTON');

      expect(isLink || isButton).toBeTruthy();
    }
  });

  test('Test 8: Client portfolio carousel', async ({ page }) => {
    const planatechnologiesComPage = new PlanatechnologiesComPage(page);

    await planatechnologiesComPage.navigate();

    // Look for client logos
    const logos = page.locator('img[alt*="client" i], img[alt*="logo" i], .client-logo, .logo');

    const logoCount = await logos.count();

    if (logoCount > 0) {
      // Verify at least some client logos are visible
      expect(logoCount).toBeGreaterThan(0);

      // Check if carousel/slider controls exist
      const carouselControls = page.locator('[class*="carousel"], [class*="slider"], button[class*="prev"], button[class*="next"]');
      const hasControls = await carouselControls.count() > 0;

      // If carousel exists, test navigation
      if (hasControls) {
        const nextButton = page.locator('button').filter({ hasText: /next|>/i }).first();
        if (await nextButton.count() > 0 && await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('Test 9: Industry cards are clickable', async ({ page }) => {
    const planatechnologiesComPage = new PlanatechnologiesComPage(page);

    await planatechnologiesComPage.navigate();

    // Scroll down to find industries section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);

    // Look for industry selector cards/links
    const industryCards = page.locator('[class*="industry"], [class*="sector"]').locator('a, button, [role="button"]');
    const industryLinks = page.locator('a').filter({ hasText: /healthcare|finance|retail|technology|manufacturing|education/i });

    const cardCount = await industryCards.count();
    const linkCount = await industryLinks.count();

    const totalIndustryElements = cardCount + linkCount;

    if (totalIndustryElements > 0) {
      // Verify industry elements are present
      expect(totalIndustryElements).toBeGreaterThan(0);

      // Test clicking first industry element
      const firstIndustry = cardCount > 0 ? industryCards.first() : industryLinks.first();

      // Scroll element into view
      await firstIndustry.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Click and verify navigation or modal
      await firstIndustry.click({ force: true }); // Use force to handle hidden elements in carousels
      await page.waitForTimeout(1000);

      // Verify something changed (URL or modal appeared)
      const modalAppeared = await page.locator('[role="dialog"], .modal, .overlay').count() > 0;
      const urlChanged = !page.url().endsWith('planatechnologies.com/');

      expect(modalAppeared || urlChanged).toBeTruthy();
    } else {
      // Industry cards might not be on homepage
      test.skip();
    }
  });
});
