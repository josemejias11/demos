import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly navigation: Locator;
  readonly logo: Locator;
  readonly searchLink: Locator;
  readonly cookieConsent: Locator;
  readonly chatBot: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigation = page.locator('nav').first();
    this.logo = page.getByRole('link', { name: 'dark' }).first();
    this.searchLink = page.getByRole('link', { name: 'Search' });
    this.cookieConsent = page.locator('text=This website uses cookies');
    this.chatBot = page.getByText('FPT Software Chatbot');
  }

  async navigateToHome() {
    await this.page.goto('/');
  }

  async clickNavigation(linkName: string) {
    // Target header navigation specifically to avoid footer link conflicts and strict mode violations
    const headerNav = this.page.locator('#header').first();
    await headerNav.waitFor({ state: 'visible', timeout: 10000 });
    
    // Check if this is mobile viewport
    const viewport = this.page.viewportSize();
    const isMobile = viewport && viewport.width < 768;
    
    if (isMobile) {
      // On mobile, try multiple hamburger menu selectors
      const hamburgerSelectors = [
        '[class*="hamburger"]',
        '[class*="menu-toggle"]',
        '[aria-label="Menu"]',
        '.mobile-menu-btn',
        '[data-testid="mobile-menu"]',
        '.navbar-toggler'
      ];
      
      let menuOpened = false;
      for (const selector of hamburgerSelectors) {
        const hamburger = this.page.locator(selector);
        const isVisible = await hamburger.first().isVisible({ timeout: 1000 }).catch(() => false);
        if (isVisible) {
          await hamburger.first().click();
          await this.page.waitForTimeout(1000);
          menuOpened = true;
          break;
        }
      }
      
      // If no hamburger found, check if mobile nav is already visible
      if (!menuOpened) {
        const mobileNav = this.page.locator('.mobile-nav, .navbar-collapse, [class*="mobile-menu"]');
        const isMobileNavVisible = await mobileNav.first().isVisible({ timeout: 1000 }).catch(() => false);
        if (!isMobileNavVisible) {
          console.log('Mobile navigation not found or already visible');
        }
      }
    }
    
    // Try multiple navigation strategies with longer timeouts
    const navSelectors = [
      headerNav.getByRole('link', { name: linkName, exact: true }),
      headerNav.getByRole('link', { name: new RegExp(linkName, 'i') }),
      this.page.getByRole('link', { name: linkName, exact: true }).first(),
      this.page.getByRole('link', { name: new RegExp(linkName, 'i') }).first(),
      this.page.locator(`a[href*="${linkName.toLowerCase()}"]`).first()
    ];
    
    let clicked = false;
    for (const selector of navSelectors) {
      try {
        await selector.waitFor({ state: 'visible', timeout: 3000 });
        // Use force click on mobile to avoid interception issues
        await selector.click({ force: !!isMobile, timeout: 8000 });
        clicked = true;
        break;
      } catch (e) {
        console.log(`Failed to click with selector: ${e.message}`);
        continue;
      }
    }
    
    if (!clicked) {
      throw new Error(`Could not find or click navigation link: ${linkName}. Available links: ${await this.getAvailableNavigationLinks()}`);
    }
    
    // Wait for navigation to complete
    await this.page.waitForLoadState('domcontentloaded');
  }
  
  private async getAvailableNavigationLinks(): Promise<string> {
    try {
      const links = await this.page.locator('a').allTextContents();
      return links.filter(link => link.trim()).slice(0, 10).join(', ');
    } catch {
      return 'Could not retrieve link list';
    }
  }

  async acceptCookies() {
    const acceptButton = this.page.getByText('Accept');
    if (await acceptButton.isVisible()) {
      await acceptButton.click();
    }
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.navigation.waitFor({ state: 'visible', timeout: 10000 });
  }

  async validatePageTitle(expectedTitle: string) {
    await expect(this.page).toHaveTitle(new RegExp(expectedTitle, 'i'));
  }

  async validateNavigationVisible() {
    await expect(this.navigation).toBeVisible();
    await expect(this.logo).toBeVisible();
  }

  async waitForChatBotToLoad() {
    await this.page.waitForTimeout(2000); // Allow chat bot to load
  }
}
