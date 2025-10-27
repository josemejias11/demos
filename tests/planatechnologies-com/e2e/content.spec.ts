import { test, expect } from '@playwright/test';
import { PlanatechnologiesComPage } from '../pageObjects/PlanatechnologiesComPage';
import { setupPageGuards } from '../setup/global.setup';

test.describe('Plan A Technologies - Content Verification Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await setupPageGuards(page, testInfo.title);
  });

  test('Test 14: Technology stack display', async ({ page }) => {
    const planatechnologiesComPage = new PlanatechnologiesComPage(page);

    await planatechnologiesComPage.navigate();

    // Scroll down to find technology section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));

    // Look for technology stack logos and names
    const techLogos = page.locator('img[alt*="tech" i], img[alt*="language" i], img[alt*="framework" i]');
    const techNames = page.locator('text=/react|angular|vue|node|python|java|typescript|javascript/i');

    const logoCount = await techLogos.count();
    const nameCount = await techNames.count();

    // Verify technology stack is displayed (either as logos or text)
    const hasTechDisplay = logoCount > 0 || nameCount > 0;

    expect(hasTechDisplay).toBeTruthy();

    // Verify multiple technologies are shown
    const totalTech = Math.max(logoCount, nameCount);
    expect(totalTech).toBeGreaterThan(3);
  });

  test('Test 15: Service model cards', async ({ page }) => {
    const planatechnologiesComPage = new PlanatechnologiesComPage(page);

    await planatechnologiesComPage.navigate();

    // Get page content
    const content = await page.locator('body').textContent();

    // Look for service model keywords
    const hasProjectBased = /project.?based|project delivery/i.test(content || '');
    const hasDedicatedTalent = /dedicated talent|staff augmentation|dedicated team/i.test(content || '');
    const hasConsulting = /consulting|advisory|consultation/i.test(content || '');

    // Verify at least 2 service models are mentioned
    const serviceModels = [hasProjectBased, hasDedicatedTalent, hasConsulting].filter(Boolean);
    expect(serviceModels.length).toBeGreaterThanOrEqual(2);

    // Look for service cards/sections
    const serviceCards = page.locator('[class*="service"], [class*="offering"]');
    const cardCount = await serviceCards.count();

    // If cards exist, verify they're visible
    if (cardCount > 0) {
      const firstCard = serviceCards.first();
      await expect(firstCard).toBeVisible();
    }
  });
});
