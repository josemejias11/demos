import { Page, Locator } from '@playwright/test';
import { siteConfig } from '../site.config';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string = '/') {
    await this.page.goto(path, {
      timeout: siteConfig.timeouts.navigation,
      waitUntil: 'domcontentloaded',
    });
    await this.handleCookieConsent();
    await this.waitForPageLoad();
  }

  async handleCookieConsent() {
    const cookieSelectors = [
      'button:has-text("Allow All")',
      'button:has-text("Accept All")',
      'button:has-text("Accept")',
      'button:has-text("Allow")',
      'button:has-text("Agree")',
      '[data-testid="cookie-accept"]',
      '.cookie-accept'
    ];

    for (const selector of cookieSelectors) {
      try {
        await this.page.locator(selector).first().click({ timeout: 2000 });
        break;
      } catch {
        // Continue to next selector
      }
    }
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('load');
  }
}
