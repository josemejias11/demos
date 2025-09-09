import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Testlio Homepage
 * Uses adaptive locator strategies and framework integration
 */
export class TestlioHomePage {
  readonly page: Page;
  
  // Header elements
  readonly logo: Locator;
  readonly mainNavigation: Locator;
  readonly advantageLink: Locator;
  readonly solutionsLink: Locator;
  readonly resourcesLink: Locator;
  readonly contactSalesButton: Locator;
  readonly signInLink: Locator;
  readonly becomeATesterLink: Locator;

  // Hero section
  readonly heroHeading: Locator;
  readonly heroSubtext: Locator;
  readonly heroCTA: Locator;

  // Content sections
  readonly clientLogos: Locator;
  readonly servicesSection: Locator;
  readonly testimonialsSection: Locator;
  readonly caseStudiesSection: Locator;

  // Footer
  readonly footer: Locator;
  readonly newsletterSignup: Locator;
  readonly newsletterEmail: Locator;
  readonly newsletterSubmit: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Header elements with adaptive selectors
    this.logo = page.locator('header').getByRole('link', { name: /testlio homepage/i });
    this.mainNavigation = page.locator('nav').first();
    this.advantageLink = page.getByRole('link', { name: /the testlio advantage/i });
    this.solutionsLink = page.getByRole('link', { name: /our solutions/i });
    this.resourcesLink = page.getByRole('link', { name: /resources/i });
    // Use header-specific selector to avoid ambiguity with multiple contact sales links
    this.contactSalesButton = page.locator('header').getByRole('link', { name: /contact sales/i });
    this.signInLink = page.getByRole('link', { name: /sign in/i });
    this.becomeATesterLink = page.getByRole('link', { name: /become a tester/i });

    // Hero section
    this.heroHeading = page.getByRole('heading', { name: /what if everything/i });
    this.heroSubtext = page.locator('main p').first();
    this.heroCTA = page.locator('main').getByRole('link', { name: /contact sales/i }).first();

    // Content sections - more specific selectors for client logos
    this.clientLogos = page.locator('img[alt*="Athena"], img[alt*="BBC"], img[alt*="Microsoft"], img[alt*="Netflix"], img[alt*="PayPal"], img[alt*="Uber"]');
    this.servicesSection = page.locator('section').filter({ hasText: /extensive real-world validation/i });
    this.testimonialsSection = page.locator('section').filter({ hasText: /delivering exceptional client outcomes/i });
    this.caseStudiesSection = page.locator('section').filter({ hasText: /case studies/i });

    // Footer
    this.footer = page.locator('footer');
    this.newsletterSignup = page.locator('section').filter({ hasText: /subscribe to our newsletter/i });
    this.newsletterEmail = page.getByPlaceholder(/enter e-mail/i);
    this.newsletterSubmit = page.getByRole('button', { name: /subscribe/i });
  }

  async navigate() {
    await this.page.goto('https://testlio.com');
  }

  async handleCookieConsent() {
    try {
      const cookieButton = this.page.getByRole('button', { name: /allow all cookies/i });
      if (await cookieButton.isVisible({ timeout: 3000 })) {
        await cookieButton.click();
      }
    } catch {
      // Cookie banner not present or already handled
    }
  }

  async clickContactSales() {
    await this.contactSalesButton.click();
  }

  async subscribeToNewsletter(email: string) {
    await this.newsletterEmail.scrollIntoViewIfNeeded();
    await this.newsletterEmail.fill(email);
    await this.newsletterSubmit.click();
  }

  async navigateToSection(section: 'advantage' | 'solutions' | 'resources') {
    switch (section) {
      case 'advantage':
        await this.advantageLink.click();
        break;
      case 'solutions':
        await this.solutionsLink.click();
        break;
      case 'resources':
        await this.resourcesLink.click();
        break;
    }
  }

  async verifyHeroSection() {
    await this.heroHeading.waitFor();
    await this.heroSubtext.waitFor();
    await this.heroCTA.waitFor();
  }

  async getClientLogosCount(): Promise<number> {
    const logos = this.clientLogos.locator('img, figure');
    return await logos.count();
  }
}
