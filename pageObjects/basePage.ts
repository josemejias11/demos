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
    try {
      // The most bulletproof way to bypass a heavy takeover cookie banner in Playwright
      // is to simply inject a CSS rule that hides it permanently. This works even if the
      // banner script takes several seconds to load and mount the elements.
      await this.page.addStyleTag({
        content: `
          #onetrust-consent-sdk, 
          .onetrust-pc-dark-filter,
          .ot-fade-in { 
            display: none !important; 
            opacity: 0 !important; 
            pointer-events: none !important; 
            z-index: -1 !important;
          }
        `
      });
      
      // We don't need to wait for anything because the CSS applies instantly.
    } catch {
      // Ignore if evaluation fails
    }
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('load');
  }
}
