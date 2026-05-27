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
    const combinedSelector = [
      '#accept-recommended-btn-handler',
      '#onetrust-accept-btn-handler',
      'button:has-text("Allow All")',
      'button:has-text("Accept All")',
      'button:has-text("Accept")',
      'button:has-text("Allow")',
      'button:has-text("Agree")',
      '[data-testid="cookie-accept"]',
      '.cookie-accept'
    ].join(', ');

    try {
      await this.page.locator(combinedSelector).first().click({ timeout: 4000 });
    } catch {
      // No cookie banner appeared within 4s, proceed with test
    }
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('load');
  }
}
