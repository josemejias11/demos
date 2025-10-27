import { test, expect } from '@playwright/test';
import { PlanatechnologiesComPage } from '../pageObjects/PlanatechnologiesComPage';
import { setupPageGuards } from '../setup/global.setup';

test.describe('Plan A Technologies - Smoke Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Setup observability guards
    await setupPageGuards(page, testInfo.title);
  });

  test('Test 1: Homepage loads successfully', async ({ page }) => {
    const planatechnologiesComPage = new PlanatechnologiesComPage(page);

    await planatechnologiesComPage.navigate();

    // Verify page loaded with correct URL
    await expect(page).toHaveURL(/planatechnologies\.com/);

    // Verify page has a title
    await expect(page).toHaveTitle(/.+/);

    // Verify page is not showing error
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toMatch(/\b404\b/); // Match 404 as a whole word
    expect(bodyText).not.toContain('Page Not Found');
  });

  test('Test 6: Contact form is displayed', async ({ page }) => {
    const planatechnologiesComPage = new PlanatechnologiesComPage(page);

    await planatechnologiesComPage.navigate();

    // Look for contact form or CTA buttons
    const contactForm = page.locator('form, .contact-form, #contact-form');
    const ctaButtons = page.locator('button, a').filter({ hasText: /let'?s talk|contact|get started/i });

    // Verify either form is visible or CTA button exists
    const formVisible = await contactForm.count() > 0;
    const ctaVisible = await ctaButtons.count() > 0;

    expect(formVisible || ctaVisible).toBeTruthy();
  });

  test('Test 13: Homepage statistics are displayed', async ({ page }) => {
    const planatechnologiesComPage = new PlanatechnologiesComPage(page);

    await planatechnologiesComPage.navigate();

    // Get page content
    const content = await page.locator('body').textContent();

    // Verify key statistics are present (flexible matching)
    const hasProductDeployments = /400\+|deployments/i.test(content || '');
    const hasClientReferrals = /75\+|referrals/i.test(content || '');
    const hasClients = /200\+|clients/i.test(content || '');

    // At least 2 out of 3 statistics should be visible
    const statsCount = [hasProductDeployments, hasClientReferrals, hasClients].filter(Boolean).length;
    expect(statsCount).toBeGreaterThanOrEqual(2);
  });
});
