import siteConfig from '../site.config.js';
import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage.js';

export class JobsityComPage extends BasePage {
  readonly navigationMenu: Locator;
  readonly searchBox: Locator;
  readonly mainContent: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    super(page);
    this.navigationMenu = page.locator('nav, .navigation, .main-nav, .navbar').first();
    this.searchBox = page.locator('[name="search"], .search-input, #search').first();
    this.mainContent = page.locator('main, .main-content, .content, #content').first();
    this.footer = page.locator('footer, .footer, .site-footer').first();
  }


  async performSearch(query: string) {
    const search = this.page.locator('[data-testid="search"], input[type="search"], input[placeholder*="search" i]').first();
    if (await search.count()) {
      await search.fill(query);
      await search.press('Enter');
      await super.waitForPageLoad();
    }
  }

  async navigate() {
    await super.navigate(siteConfig.baseURL);
  }
}
