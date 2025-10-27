import { test, expect } from '@playwright/test';
import { PlanatechnologiesComPage } from '../pageObjects/PlanatechnologiesComPage';
import { setupPageGuards } from '../setup/global.setup';

test.describe('Plan A Technologies - Form Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await setupPageGuards(page, testInfo.title);
  });

  test('Test 10: Contact form validation', async ({ page }) => {
    const planatechnologiesComPage = new PlanatechnologiesComPage(page);

    await planatechnologiesComPage.navigate();

    // Look for contact form
    const forms = page.locator('form');
    const formCount = await forms.count();

    if (formCount === 0) {
      // If no form on homepage, look for contact link and navigate
      const contactLink = page.locator('a').filter({ hasText: /contact|get in touch/i }).first();
      if (await contactLink.count() > 0) {
        await contactLink.click();
        await page.waitForLoadState('networkidle');
      }
    }

    // Try to find form fields
    const emailInput = page.locator('input[type="email"], input[name*="email"], input[placeholder*="email" i]').first();

    // Test email validation if email field exists
    if (await emailInput.count() > 0) {
      await emailInput.fill('invalid-email');
      await emailInput.blur();

      // Check if validation message appears (may vary by implementation)
      const hasValidation = await page.locator('text=/invalid|valid email/i').count() > 0 ||
                           await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);

      expect(hasValidation).toBeTruthy();

      // Test valid email
      await emailInput.fill('test@example.com');
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
      expect(isValid).toBeTruthy();
    }
  });

  test('Test 11: Contact form submission', async ({ page }) => {
    const planatechnologiesComPage = new PlanatechnologiesComPage(page);

    await planatechnologiesComPage.navigate();

    // Look for contact form
    const forms = page.locator('form');
    const formCount = await forms.count();

    if (formCount === 0) {
      // Navigate to contact page if needed
      const contactLink = page.locator('a').filter({ hasText: /contact/i }).first();
      if (await contactLink.count() > 0) {
        await contactLink.click();
        await page.waitForLoadState('networkidle');
      } else {
        test.skip();
        return;
      }
    }

    // Fill out form with test data
    const nameInput = page.locator('input[name*="name"], input[placeholder*="name" i]').first();
    const emailInput = page.locator('input[type="email"], input[name*="email"]').first();
    const messageInput = page.locator('textarea, input[name*="message"]').first();

    if (await nameInput.count() > 0) await nameInput.fill('John Doe');
    if (await emailInput.count() > 0) await emailInput.fill('john.doe@example.com');
    if (await messageInput.count() > 0) await messageInput.fill('Test inquiry message');

    // Find and click submit button
    const submitButton = page.locator('button[type="submit"], input[type="submit"], button').filter({ hasText: /submit|send|contact/i }).first();

    if (await submitButton.count() > 0) {
      // Note: We won't actually submit in automated tests to avoid spam
      // Just verify the button exists and is enabled
      await expect(submitButton).toBeEnabled();
    }
  });

  test('Test 12: Service inquiry form', async ({ page }) => {
    const planatechnologiesComPage = new PlanatechnologiesComPage(page);

    await planatechnologiesComPage.navigate();

    // Look for "LET'S TALK" or service inquiry CTA
    const ctaButton = page.locator('button, a').filter({ hasText: /let'?s talk|get started|contact us/i }).first();

    if (await ctaButton.count() > 0) {
      await ctaButton.click();

      // Wait for modal or page load
      await page.waitForTimeout(1000);

      // Check if form or contact method appeared
      const hasForm = await page.locator('form').count() > 0;
      const hasEmail = await page.locator('a[href^="mailto:"]').count() > 0;
      const hasPhone = await page.locator('a[href^="tel:"]').count() > 0;

      // Verify at least one contact method is available
      expect(hasForm || hasEmail || hasPhone).toBeTruthy();
    } else {
      test.skip();
    }
  });
});
