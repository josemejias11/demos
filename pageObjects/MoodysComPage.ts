import { Page } from '@playwright/test';
import { BasePage } from './basePage';
import { container } from '@core/container';
import { runWithContext } from '@core/runTypes';
import type { LocatorIntent } from '@locators/resolver/intentTypes';

const MOODYS_CONTEXT = {
  sessionId: 'moodys-smoke',
  domain: 'moodys.com',
  siteType: 'finance',
  capabilities: undefined,
} as const;

export class MoodysComPage extends BasePage {
  private readonly locatorResolver = container.get('locatorResolver');
  private readonly knowledgeService = container.get('knowledgeService');

  constructor(page: Page) {
    super(page);
  }

  async getNavigationMenu() {
    return runWithContext(MOODYS_CONTEXT, async () => {
      const intent: LocatorIntent = {
        target: 'navigation menu',
        action: 'assert',
        roleHint: 'navigation',
        synonyms: ['nav', 'header menu', 'main menu', 'site navigation'],
        // Moodys uses div-based layout — no semantic <nav> or [role="navigation"]
        fallbackSelectors: ["header", "[class*='nav']", "[class*='header']", "[class*='menu']"],
      };
      const resolution = await this.locatorResolver.resolve(intent);
      const validated = await this.locatorResolver.validateOnPage(this.page, resolution, 500);
      if (validated.best?.validated) {
        this.knowledgeService.recordSuccessfulSelector(
          intent.target,
          validated.best.selector,
          validated.best.score ?? 0.7,
          { domain: 'moodys.com', siteType: 'finance' },
        );
      }
      return validated;
    });
  }

  async getMainContent() {
    return runWithContext(MOODYS_CONTEXT, async () => {
      const intent: LocatorIntent = {
        target: 'main content area',
        action: 'assert',
        roleHint: 'main',
        synonyms: ['content', 'main', 'body content', 'page content'],
        fallbackSelectors: ["[class*='content']", "[class*='main']", "[class*='body']", 'section'],
      };
      const resolution = await this.locatorResolver.resolve(intent);
      const validated = await this.locatorResolver.validateOnPage(this.page, resolution, 500);
      if (validated.best?.validated) {
        this.knowledgeService.recordSuccessfulSelector(
          intent.target,
          validated.best.selector,
          validated.best.score ?? 0.7,
          { domain: 'moodys.com', siteType: 'finance' },
        );
      }
      return validated;
    });
  }

  async getFooter() {
    return runWithContext(MOODYS_CONTEXT, async () => {
      const intent: LocatorIntent = {
        target: 'footer',
        action: 'assert',
        roleHint: 'contentinfo',
        synonyms: ['page footer', 'site footer'],
        fallbackSelectors: ["footer", "[class*='footer']"],
      };
      const resolution = await this.locatorResolver.resolve(intent);
      const validated = await this.locatorResolver.validateOnPage(this.page, resolution, 500);
      if (validated.best?.validated) {
        this.knowledgeService.recordSuccessfulSelector(
          intent.target,
          validated.best.selector,
          validated.best.score ?? 0.7,
          { domain: 'moodys.com', siteType: 'finance' },
        );
      }
      return validated;
    });
  }

  async performSearch(query: string) {
    await runWithContext(MOODYS_CONTEXT, async () => {
      const intent: LocatorIntent = {
        target: 'search box',
        action: 'fill',
        roleHint: 'textbox',
        synonyms: ['search input', 'search field', 'find'],
        fallbackSelectors: [
          "input[type='search']",
          "[class*='search'] input",
          "[placeholder*='search' i]",
        ],
      };
      const resolution = await this.locatorResolver.resolve(intent);
      const validated = await this.locatorResolver.validateOnPage(this.page, resolution, 500);
      if (validated.best?.validated && validated.best.selector) {
        const searchEl = this.page.locator(validated.best.selector).first();
        await searchEl.fill(query);
        await searchEl.press('Enter');
        await this.waitForPageLoad();
        this.knowledgeService.recordSuccessfulSelector(
          intent.target,
          validated.best.selector,
          validated.best.score ?? 0.7,
          { domain: 'moodys.com', siteType: 'finance' },
        );
      }
    });
  }
}
