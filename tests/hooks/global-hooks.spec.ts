import { test } from '@playwright/test';
import { BasePage } from '../pageObjects/BasePage';

// Global hook: best-effort dismiss overlays before each test so page interactions
// are less likely to be blocked by cookie banners or newsletter modals.
test.beforeEach(async ({ page }) => {
  const basePage = new BasePage(page);
  try {
    // allow initial DOM/scripts to run a short moment
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(200);
    await basePage.dismissOverlays();
  } catch (e) {
    // swallow — helper is best-effort
  }
});
