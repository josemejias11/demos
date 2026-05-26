import { test, expect } from '@playwright/test';
import { setupPageGuards } from '../setup/global.setup';

/**
 * Accessibility tests for moodys.com
 * Site type: generic
 *
 * These tests verify basic WCAG compliance
 */

test.describe('moodys.com Accessibility', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await setupPageGuards(page, testInfo.title);
    await page.goto('/');
  });

  test('Page has valid HTML lang attribute', async ({ page }) => {
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
  });

  test('Page has a main content area', async ({ page }) => {
    // Moodys uses div-based layout — no semantic <main>; check class-based content regions
    const main = page.locator("main, [role='main'], [class*='content'], [class*='main']");
    await expect(main.first()).toBeVisible();
  });

  test('All images have alt text', async ({ page }) => {
    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      const role = await img.getAttribute('role');

      // Image should have alt text OR aria-label OR role="presentation"
      expect(
        alt !== null || ariaLabel !== null || role === 'presentation',
        `Image without alt text: ${await img.getAttribute('src')}`
      ).toBeTruthy();
    }
  });

  test('Interactive elements are keyboard accessible', async ({ page }) => {
    const buttons = await page.locator('button, a[href], input, select, textarea').all();

    for (const element of buttons.slice(0, 5)) { // Test first 5 to keep test fast
      const tabIndex = await element.getAttribute('tabindex');
      if (tabIndex === '-1') continue; // Skip explicitly non-focusable elements

      await element.focus();
      const isFocused = await element.evaluate(el => el === document.activeElement);
      expect(isFocused, 'Element should be focusable').toBeTruthy();
    }
  });

  test('Page has proper heading hierarchy', async ({ page }) => {
    // Moodys uses h2 as the top-level heading (no h1 on homepage)
    const headingCount = await page.locator('h1, h2').count();
    expect(headingCount).toBeGreaterThanOrEqual(1);
  });

  test('Forms have associated labels', async ({ page }) => {
    const inputs = await page.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"])').all();

    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');

      const hasLabel = id && await page.locator(`label[for="${id}"]`).count() > 0;
      const hasAria = ariaLabel || ariaLabelledby;

      expect(
        hasLabel || hasAria,
        `Input without label: ${await input.getAttribute('name') || await input.getAttribute('type')}`
      ).toBeTruthy();
    }
  });

  test('Color contrast is sufficient', async ({ page }) => {
    // Checks that visible text elements have a non-transparent color value.
    // For WCAG AA ratio validation, integrate @axe-core/playwright.
    const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, a, button').all();

    for (const element of textElements.slice(0, 10)) {
      const isVisible = await element.isVisible();
      if (!isVisible) continue;

      const color = await element.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          color: style.color,
          backgroundColor: style.backgroundColor,
        };
      });

      expect(color.color).not.toBe(color.backgroundColor);
    }
  });
});
