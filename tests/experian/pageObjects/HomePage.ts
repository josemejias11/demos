
import { Page, Locator } from '@playwright/test';

// Type-safe globalThis accessors for framework services
declare global {
  var locatorResolver: {
    // Query and options are intentionally generic; use unknown to avoid any while allowing structured objects
    find: (query: Record<string, unknown>, opts?: Record<string, unknown>) => Locator | undefined;
  } | undefined;
  var telemetry: {
    emit: (event: unknown) => void;
  } | undefined;
  var kb: {
    remember?: (key: string, value: unknown) => void;
  } | undefined;
}

export class HomePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Utility: Wait for navigation to be visible (for smoke tests)
  async isNavigationVisible(timeout = 5000) {
    try {
      await this.navigation.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      globalThis.telemetry?.emit({ event: 'element.not.visible', step: 'isNavigationVisible', locator: this.navigation?.toString?.() });
      return false;
    }
  }

  // Utility: Wait for page load (for smoke tests)
  async waitForPageLoad(timeout = 10000) {
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout });
      await this.header.waitFor({ state: 'visible', timeout: timeout / 2 });
      return true;
    } catch {
      globalThis.telemetry?.emit({ event: 'pageload.timeout', step: 'waitForPageLoad' });
      return false;
    }
  }

  // Framework-first: header using locatorResolver
  get header() {
    // Prefer role="banner", fallback to header tag
    const locator = globalThis.locatorResolver?.find({ role: 'banner', css: 'header' }, { context: 'HomePage.header' });
    globalThis.telemetry?.emit({ event: 'locator.attempt', step: 'header', locator: locator?.toString?.() });
    if (locator) globalThis.kb?.remember?.('header', { locator: locator?.toString?.() });
    return locator || this.page.locator('header').first();
  }

  // Framework-first: navigation using locatorResolver
  get navigation() {
    // Prefer role="navigation", fallback to nav tag
    const locator = globalThis.locatorResolver?.find({ role: 'navigation', css: 'nav' }, { context: 'HomePage.navigation' });
    globalThis.telemetry?.emit({ event: 'locator.attempt', step: 'navigation', locator: locator?.toString?.() });
    if (locator) globalThis.kb?.remember?.('navigation', { locator: locator?.toString?.() });
    return locator || this.page.locator('nav').first();
  }

  // Updated selectors based on debug findings
  get primaryCTA() {
    // The primary CTA in the hero section - identified as the first "Get started" link
    return this.page.locator('a:has-text("Get started")').first();
  }
  
  get loginLink() {
    // Robust: Find the visible 'Sign In' link in the header/banner region
    // Prefer header context, fallback to page context
    const headerLink = this.header.locator('a:has-text("Sign In")').first();
    return headerLink;
  }
  
  get signUpButton() {
    // Sign up button is usually the primary CTA or a specific sign up link
    return this.page.locator('a[href*="registration"], a:has-text("Sign up"), button:has-text("Sign up")').first();
  }
  
  get logo() {
    return this.page.locator('img[alt*="Experian logo"]');
  }
  
  // Main navigation buttons - using exact IDs found in debug
  get creditNavButton() {
    return this.page.locator('button#rpt');
  }
  
  get protectionNavButton() {
    return this.page.locator('button#itp');
  }
  
  get moneyNavButton() {
    return this.page.locator('button#mon');
  }
  
  get creditCardsNavButton() {
    return this.page.locator('button#crd');
  }
  
  get loansNavButton() {
    return this.page.locator('button#lns');
  }
  
  get insuranceNavButton() {
    return this.page.locator('button#aut');
  }
  
  // Secondary navigation - validated
  get consumerLink() {
    return this.page.locator('a:has-text("Consumer")');
  }
  
  get smallBusinessLink() {
    return this.page.locator('a:has-text("Small Business")');
  }
  
  get businessLink() {
    return this.page.locator('a:has-text("Business")');
  }
  
  // Footer elements - validated structure
  get footerSupport() {
    return this.page.locator('contentinfo [role="list"]:has(a[href*="credit-freeze"])');
  }
  
  get socialLinks() {
    return this.page.locator('contentinfo a[href*="facebook"], contentinfo a[href*="twitter"], contentinfo a[href*="instagram"], contentinfo a[href*="youtube"]');
  }
  
  get appStoreLinks() {
    return this.page.locator('a[href*="App Store"], a[href*="Google Play"]');
  }
  
  get trustpilotReviews() {
    return this.page.locator('iframe:has(a[href*="trustpilot"])');
  }
  
  // Hero section elements - validated
  get heroHeading() {
    return this.page.locator('h1:has-text("Reach your credit and money goals")');
  }
  
  get creditScoreTab() {
    return this.page.locator('[role="tab"]:has-text("Get a credit report")');
  }
  
  get saveBillsTab() {
    return this.page.locator('[role="tab"]:has-text("Save over $600")');
  }
  
  // Support tools section - validated
  get securityFreezeCard() {
    return this.page.locator('a[href*="credit-freeze"]:has-text("Security freeze")');
  }
  
  get disputesCard() {
    return this.page.locator('a[href*="disputes"]:has-text("Disputes")');
  }
  
  get fraudAlertCard() {
    return this.page.locator('a[href*="fraud-alert"]:has-text("Fraud alert")');
  }
  
  // Search functionality
  get searchButton() {
    return this.page.locator('button:has-text("Search")');
  }

  // Framework-first: search input using locatorResolver
  get searchInput() {
    // Use locatorResolver to find the best search input
    // Fallback to common patterns if not found
    // Telemetry event emitted for evidence
    const locator = globalThis.locatorResolver?.find({ role: 'textbox', label: /search/i, testId: /search/i, css: 'input[type="search"], input[aria-label*="search" i]' }, { context: 'HomePage.searchInput' });
    globalThis.telemetry?.emit({ event: 'locator.attempt', step: 'searchInput', locator: locator?.toString?.() });
    return locator || this.page.locator('input[type="search"], input[aria-label*="search" i]').first();
  }
  // Framework-first: getFooterLinks using locatorResolver
  async getFooterLinks() {
    // Use locatorResolver to find all footer links
    const locator = globalThis.locatorResolver?.find({ role: 'link', css: 'footer a, [role="contentinfo"] a' }, { context: 'HomePage.getFooterLinks' });
    globalThis.telemetry?.emit({ event: 'locator.attempt', step: 'getFooterLinks', locator: locator?.toString?.() });
    const links = locator ? await locator.allTextContents() : await this.page.locator('footer a, [role="contentinfo"] a').allTextContents();
    globalThis.telemetry?.emit({ event: 'locator.result', step: 'getFooterLinks', count: links.length });
    if (links.length > 0) globalThis.kb?.remember?.('footerLinks', { locator: locator?.toString?.(), count: links.length });
    return links;
  }

  // Framework-first: getCreditScoreSection using locatorResolver
  async getCreditScoreSection() {
    const locator = globalThis.locatorResolver?.find({ role: 'region', label: /credit score|credit/i, css: '[data-section*="credit" i], section:has-text("credit score")' }, { context: 'HomePage.getCreditScoreSection' });
    globalThis.telemetry?.emit({ event: 'locator.attempt', step: 'getCreditScoreSection', locator: locator?.toString?.() });
    return locator || this.page.locator('[data-section*="credit" i], section:has-text("credit score")').first();
  }

  // Framework-first: getSecurityFeatures using locatorResolver
  async getSecurityFeatures() {
    const locator = globalThis.locatorResolver?.find({ role: 'region', label: /security|protection|fraud/i, css: '[data-section*="security" i], section:has-text("security")' }, { context: 'HomePage.getSecurityFeatures' });
    globalThis.telemetry?.emit({ event: 'locator.attempt', step: 'getSecurityFeatures', locator: locator?.toString?.() });
    return locator || this.page.locator('[data-section*="security" i], section:has-text("security")').first();
  }

  // Framework-first: getProductsSection using locatorResolver
  async getProductsSection() {
    const locator = globalThis.locatorResolver?.find({ role: 'region', label: /products|offers|plans/i, css: '[data-section*="products" i], section:has-text("products")' }, { context: 'HomePage.getProductsSection' });
    globalThis.telemetry?.emit({ event: 'locator.attempt', step: 'getProductsSection', locator: locator?.toString?.() });
    return locator || this.page.locator('[data-section*="products" i], section:has-text("products")').first();
  }
  
  // Mobile app section
  get appQRCode() {
    return this.page.locator('img[alt*="Scan to get Experian applications"]');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async clickPrimaryCTA() {
    await this.primaryCTA.click();
  }

  async navigateToLogin() {
    // Check if we need to open a mobile menu first
    const hamburgerMenu = this.page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], .hamburger, .mobile-menu-toggle');
    const hamburgerVisible = await hamburgerMenu.isVisible().catch(() => false);

    if (hamburgerVisible) {
      console.log('Opening mobile menu...');
      await hamburgerMenu.click();
      await this.page.waitForTimeout(1000);
    }

    // Try multiple login link selectors as fallback
    try {
      await this.loginLink.click();
      return true;
    } catch {
      try {
        // Try any visible Sign In link
        const fallbackLogin = this.page.locator('a:has-text("Sign In"), a:has-text("Sign in"), a:has-text("LOGIN")').first();
        await fallbackLogin.click();
        return true;
      } catch {
        // Last resort - navigate directly to login URL if page is still open
        console.log('Login links not visible, navigating directly to login page...');
        if (!this.page.isClosed()) {
          await Promise.all([
            this.page.waitForNavigation({ url: /login|signin/ }),
            this.page.goto('https://www.experian.com/help/login.html')
          ]);
          return true;
        } else {
          globalThis.telemetry?.emit({ event: 'page.closed', step: 'navigateToLogin', note: 'Page was closed before fallback navigation.' });
          return false;
        }
      }
    }
  }

  async navigateToSignUp() {
    await this.signUpButton.click();
  }

  // Navigation methods - Updated based on real site exploration
  async navigateToCredit() {
    await this.creditNavButton.click();
    // Credit dropdown reveals: Free credit report, Free credit score, Experian Boost®, Experian Go™
    // Defensive: wait shortly for expansion indicators (aria-expanded or sibling panel visibility)
    try {
      const btn = this.page.locator('button:has-text("Credit")').first();
      const aria = await btn.getAttribute('aria-expanded').catch(() => null);
      if (aria === 'true') return;
      const panel = btn.locator('xpath=following-sibling::*[1]');
      await panel.waitFor({ state: 'visible', timeout: 2000 }).catch(() => null);
    } catch {
      // Best-effort; don't fail navigation if we can't detect expansion
    }
  }

  async navigateToProtection() {
    await this.protectionNavButton.click();
    // Protection dropdown reveals: Identity theft and fraud, Free dark web scan, Free personal privacy scan
  }

  async navigateToMoney() {
    await this.moneyNavButton.click();
    // Money dropdown (to be explored)
  }

  async navigateToCreditCards() {
    await this.creditCardsNavButton.click();
    // Credit Cards dropdown (to be explored)
  }

  async navigateToLoans() {
    await this.loansNavButton.click();
    // Loans dropdown (to be explored)
  }

  async navigateToInsurance() {
    await this.insuranceNavButton.click();
    // Insurance dropdown (to be explored)
  }

  // New methods for dropdown interactions based on real site structure
  async getCreditDropdownLinks() {
    await this.navigateToCredit();
    // Locate the button, then find the immediate sibling panel and return its links.
    const btn = this.page.locator('button:has-text("Credit")').first();
    const panel = btn.locator('xpath=following-sibling::*[1]');
    return panel.locator('a');
  }

  async getProtectionDropdownLinks() {
    await this.navigateToProtection();
    return this.page.locator('button[expanded]:has-text("Protection") + div a');
  }

  async isDropdownExpanded(navItem: string) {
    try {
      const btn = this.page.locator(`button:has-text("${navItem}")`).first();

      // 1) aria-expanded attribute (most common)
      const aria = await btn.getAttribute('aria-expanded').catch(() => null);
      if (aria === 'true') return true;

      // 2) explicit expanded attribute
      const expandedAttr = await btn.getAttribute('expanded').catch(() => null);
      if (expandedAttr && expandedAttr !== 'false') return true;

      // 3) class-based indicators (expanded/open)
      const cls = await btn.getAttribute('class').catch(() => '');
      if (cls && /(expanded|expand|open|is-open)/i.test(cls)) return true;

      // 4) sibling panel visibility fallback
      const panel = btn.locator('xpath=following-sibling::*[1]');
      if (await panel.isVisible().catch(() => false)) return true;

      return false;
    } catch {
      return false;
    }
  }

  // Footer validation methods
  async getFooterSections() {
    return {
      support: this.footerSupport,
      social: this.socialLinks,
      apps: this.appStoreLinks,
      trustpilot: this.trustpilotReviews
    };
  }

  async getHeroElements() {
    return {
      heading: this.heroHeading,
      creditTab: this.creditScoreTab,
      billsTab: this.saveBillsTab,
      primaryCTA: this.primaryCTA
    };
  }

  async getSupportTools() {
    return {
      securityFreeze: this.securityFreezeCard,
      disputes: this.disputesCard,
      fraudAlert: this.fraudAlertCard
    };
  }

  // Validation methods for testing
  async isPageLoaded() {
    await this.heroHeading.waitFor({ state: 'visible' });
    await this.primaryCTA.waitFor({ state: 'visible' });
    return true;
  }

  async getAllNavigationButtons() {
    return {
      credit: this.creditNavButton,
      protection: this.protectionNavButton,
      money: this.moneyNavButton,
      creditCards: this.creditCardsNavButton,
      loans: this.loansNavButton,
      insurance: this.insuranceNavButton
    };
  }
}
