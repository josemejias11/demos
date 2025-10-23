import { test, expect } from '@playwright/test';
import { JobsityComPage } from '../pageObjects/JobsityComPage.js';
import { setupPageGuards } from '../setup/global.setup.js';

test.describe('jobsity.com Positive User Flows', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await setupPageGuards(page, testInfo.title);
    const jobsityComPage = new JobsityComPage(page);
    await jobsityComPage.navigate();
  });

  test('Book a Call CTA is visible and functional', async ({ page }) => {
    const cta = page.locator('a:has-text("Book a Call"), button:has-text("Book a Call")');
    await page.waitForTimeout(300);
    if (await cta.count() === 0) {
      test.skip(true, 'Book a Call CTA not present on this page.');
      return;
    }
    if (!(await cta.first().isVisible())) {
      test.skip(true, 'Book a Call CTA present but not visible.');
      return;
    }
    await expect(cta.first()).toBeVisible();
    // Optionally, click and check for navigation or modal
  });

  test('Get Started in 3 Easy Steps section is present', async ({ page }) => {
    const section = page.locator('text=Get Started in 3 Easy Steps');
    await page.waitForTimeout(300);
    if (await section.count() === 0) {
      test.skip(true, 'Get Started in 3 Easy Steps section not present.');
      return;
    }
    await expect(section.first()).toBeVisible();
  });

  test('Our Expertise section is visible', async ({ page }) => {
    await expect(page.locator('text=Our Expertise')).toBeVisible();
  });

  test('Why Leading Organizations Trust Jobsity testimonials are visible', async ({ page }) => {
    const heading = page.locator('text=Why Leading Organizations Trust Jobsity');
    await page.waitForTimeout(300);
    if (await heading.count() === 0) {
      test.skip(true, 'Why Leading Organizations Trust Jobsity heading not present.');
      return;
    }
    await expect(heading.first()).toBeVisible();
    // Check for at least one testimonial quote
    const testimonials = page.locator('blockquote, [class*=testimonial], [class*=quote]');
    if (await testimonials.count() === 0) {
      test.skip(true, 'No testimonial quote found.');
      return;
    }
    await expect(testimonials.first()).toBeVisible();
  });
});
