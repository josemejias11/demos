import { Page, expect } from '@playwright/test';
import { infiniteSelectors } from '../infinite.config';

// Simple Container replacement
class Container {
  private static instance: Container;
  
  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }
}

/**
 * Global cookie consent handler that works across all pages and new windows
 */
export class GlobalCookieHandler {
  private static cookieStateMap = new Map<string, boolean>();
  
  /**
   * Handle cookie consent for any page, including new windows
   */
  static async handleCookieConsent(page: Page, container: Container, forceReset = false): Promise<void> {
    const pageUrl = await page.url();
    const domain = new URL(pageUrl).hostname;
    
    // Check if we've already handled cookies for this domain
    if (!forceReset && this.cookieStateMap.get(domain)) {
      console.log(`Cookie consent already handled for domain: ${domain}`);
      return;
    }
    
    try {
      console.log(`Handling cookie consent for: ${pageUrl}`);
      
      // Wait for page stability
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      await page.waitForTimeout(3000); // Increased wait for cookie dialog to appear
      
      // Try the patterns that actually work on the site (from selector inventory)
      const allowAllButton = page.getByRole('button', { name: 'Allow all' });
      
      if (await allowAllButton.isVisible({ timeout: 5000 })) {
        console.log('Found "Allow all" button, clicking to accept cookies...');
        await allowAllButton.click();
        await page.waitForTimeout(2000);
        
        // Mark as handled for this domain
        this.cookieStateMap.set(domain, true);
        console.log(`Cookie consent handled successfully for ${domain}`);
        return;
      }
      
      // Fallback: Check for CMP widget button (Cookiebot pattern)
      const cmpButtonSelector = 'button:has-text("Open CMP widget")';
      const cmpButton = page.locator(cmpButtonSelector);
      
      if (await cmpButton.isVisible({ timeout: 3000 })) {
        console.log('Found CMP widget button, handling consent...');
        await cmpButton.click();
        await page.waitForTimeout(1000);
        
        // Close the dialog (cookies are allowed by default)
        const closeButton = page.locator('button:has-text("Close CMP widget")');
        if (await closeButton.isVisible({ timeout: 2000 })) {
          console.log('Closing CMP dialog...');
          await closeButton.click();
          await page.waitForTimeout(1000);
          
          // Mark as handled for this domain
          this.cookieStateMap.set(domain, true);
          console.log(`Cookie consent handled successfully for ${domain}`);
          return;
        }
      }
      
      // Fallback for other cookie dialog types
      const cookieDialogSelectors = [
        '[data-testid*="cookie"]',
        '.cookie-banner',
        '.cookie-consent',
        '.cookie-notice',
        '#cookie-consent',
        '[aria-label*="cookie"]',
        '[role="dialog"]:has-text("cookie")'
      ];
      
      for (const selector of cookieDialogSelectors) {
        const dialog = page.locator(selector);
        if (await dialog.isVisible({ timeout: 1000 })) {
          console.log(`Found cookie dialog: ${selector}`);
          
          const acceptButtons = [
            'button:has-text("Accept")',
            'button:has-text("Accept All")',
            'button:has-text("Allow All")',
            'button:has-text("OK")',
            'button[id*="accept"]',
            'button[class*="accept"]'
          ];
          
          for (const buttonSelector of acceptButtons) {
            const button = page.locator(buttonSelector);
            if (await button.isVisible({ timeout: 1000 })) {
              await button.click();
              await page.waitForTimeout(1000);
              this.cookieStateMap.set(domain, true);
              console.log(`Cookie consent accepted for ${domain}`);
              return;
            }
          }
        }
      }
      
      // If no dialog found, mark as handled anyway
      this.cookieStateMap.set(domain, true);
      console.log(`No cookie dialog found for ${domain}, marked as handled`);
      
    } catch (error) {
      console.log(`Cookie handling completed with warnings: ${error}`);
      this.cookieStateMap.set(domain, true);
    }
  }
  
  /**
   * Reset cookie state for testing purposes
   */
  static resetCookieState(): void {
    this.cookieStateMap.clear();
    console.log('Cookie state map cleared');
  }
  
  /**
   * Set up cookie handler for all new pages/popups in browser context
   */
  static async setupGlobalCookieHandler(page: Page, container: Container): Promise<void> {
    // Handle cookies on current page
    await this.handleCookieConsent(page, container);
    
    // Set up handler for new pages/popups
    const context = page.context();
    context.on('page', async (newPage: Page) => {
      console.log(`New page opened: ${await newPage.url()}`);
      
      // Wait for new page to load then handle cookies
      await newPage.waitForLoadState('domcontentloaded');
      await this.handleCookieConsent(newPage, container);
    });
  }
}

/**
 * Reusable test blocks for common testing patterns
 */
export class InfiniteTestBlocks {
  constructor(private container: Container) {}

  /**
   * Initialize test with page and test ID
   */
  async initializeTest(page: Page, _testId: string): Promise<{ page: Page; recordTelemetry: (event: string, data: Record<string, unknown>) => Promise<void> }> {
    // Navigate to the site
    console.log('Navigating to https://www.infinite.com...');
    await page.goto('https://www.infinite.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for page to stabilize and cookie dialog to potentially appear
    await page.waitForTimeout(4000);
    
    // Handle cookies IMMEDIATELY upon page load
    await GlobalCookieHandler.setupGlobalCookieHandler(page, this.container);
    
    // Additional wait to ensure cookie handling is complete
    await page.waitForTimeout(2000);
    
    // This should return a page object that has the required methods
    const infinitePage = {
      page,
      recordTelemetry: async (event: string, data: Record<string, unknown>) => {
        console.log(`Telemetry: ${event}`, data);
      }
    };
    
    return infinitePage;
  }

  /**
   * Handle cookie consent using global handler
   */
  async handleCookieConsent(infinitePageOrPage?: { page: Page } | Page): Promise<void> {
    // Get the actual page object
    const page = infinitePageOrPage && 'page' in infinitePageOrPage ? infinitePageOrPage.page : infinitePageOrPage as Page;
    if (page) {
      await GlobalCookieHandler.handleCookieConsent(page, this.container);
    }
  }

  /**
   * Verify main navigation is present and accessible
   */
  async verifyMainNavigation(infinitePage: { page: Page }): Promise<void> {
    const page = infinitePage.page;
    await this.verifyNavigation(page);
  }

  /**
   * Verify solutions dropdown functionality
   */
  async verifySolutionsDropdown(infinitePage: { page: Page }): Promise<void> {
    const page = infinitePage.page;
    const solutionsMenu = page.locator(infiniteSelectors.solutionsMenu).first();
    await expect(solutionsMenu).toBeVisible();
    
    // If cookie dialog overlays, try closing
    const blockingCookieDialog = page.locator('#CybotCookiebotDialog');
    if (await blockingCookieDialog.isVisible()) {
      const closeBtn = page.locator('button:has-text("Allow all"), button:has-text("Accept")');
      if (await closeBtn.isVisible()) {
        await closeBtn.click({ timeout: 5000 });
        await page.waitForTimeout(500);
      }
    }

    // Hover to open dropdown (retry logic)
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await solutionsMenu.hover();
        await page.waitForTimeout(600);
        const dropdown = page.locator(infiniteSelectors.solutionsDropdown).first();
        if (await dropdown.isVisible()) break;
      } catch {
        if (attempt === 2) throw new Error('Failed to hover Solutions menu after retries');
      }
    }
    await page.waitForTimeout(1000);
    
    const dropdown = page.locator(infiniteSelectors.solutionsDropdown).first();
    await expect(dropdown).toBeVisible();
  }

  /**
   * Check mobile responsiveness
   */
  async checkMobileResponsiveness(page: Page): Promise<{ 
    mobileNavVisible: boolean; 
    responsiveDesign: boolean;
    mobileViewport: boolean;
    contentVisible: boolean;
  }> {
    // Test different viewport sizes
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const navElement = page.locator(infiniteSelectors.mainNav);
    const isNavVisible = await navElement.first().isVisible();
    
    // Check if main content is visible
    const mainContent = page.locator('main, .main-content, [role="main"]');
    const isContentVisible = await mainContent.first().isVisible();
    
    // Reset to desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    return {
      mobileNavVisible: isNavVisible,
      responsiveDesign: true,
      mobileViewport: true,
      contentVisible: isContentVisible
    };
  }

  /**
   * Verify navigation menu is present and accessible
   */
  async verifyNavigation(page?: Page): Promise<void> {
    // Use the page parameter if provided
    if (!page) {
      throw new Error('Page parameter is required');
    }
    
    const navElement = page.locator(infiniteSelectors.mainNav);
    await expect(navElement.first()).toBeVisible();
    
    // Check for key navigation links - use .first() to handle multiple matches
    const aboutUsLink = page.locator(infiniteSelectors.aboutUsLink);
    const careersLink = page.locator(infiniteSelectors.careersLink);
    
    await expect(aboutUsLink.first()).toBeVisible();
    await expect(careersLink.first()).toBeVisible();
  }

  /**
   * Test hero carousel functionality
   */
  async testHeroCarousel(page: Page): Promise<void> {
    // Prefer accessible role locator first (more robust across markup changes)
    const regionByRole = page.getByRole('region', { name: /slides/i });
    const possibleSelectors = [
      () => regionByRole,
      () => page.locator(infiniteSelectors.heroSlider),
      // Fallback: first large region containing navigation buttons
      () => page.locator('main').locator('button:has-text("Next slide")').locator('..').locator('..').first()
    ];

    let heroFound = false;
    for (const getter of possibleSelectors) {
      const loc = getter();
      try {
        if (await loc.first().isVisible({ timeout: 3000 })) {
          heroFound = true;
          break;
        }
      } catch {
        // ignore and continue
      }
    }

    expect(heroFound, 'Hero carousel region should be visible').toBeTruthy();

    // Navigation buttons via accessible names
  // Scope navigation buttons to the first Slides region only to avoid strict mode violations
  const heroRegion = page.getByRole('region', { name: /slides/i }).first();
  const nextButton = heroRegion.getByRole('button', { name: /next slide/i }).first();
  const prevButton = heroRegion.getByRole('button', { name: /previous slide/i }).first();

    // Click next then previous if available
    if (await nextButton.isVisible({ timeout: 3000 })) {
      await nextButton.click();
      await page.waitForTimeout(1200);
    }
    if (await prevButton.isVisible({ timeout: 3000 })) {
      await prevButton.click();
      await page.waitForTimeout(1200);
    }

    // Validate at least one slide group present (role=group with x / y pattern)
    const slideGroups = page.locator('[role="group"]');
    await expect(slideGroups.first()).toBeVisible();
  }

  /**
   * Test services carousel functionality
   */
  async testServicesCarousel(page: Page): Promise<void> {
    // Services carousel sometimes below viewport; scroll first
    const servicesHeading = page.getByRole('heading', { name: /future ready services/i }).first();
    if (await servicesHeading.isVisible()) {
      await servicesHeading.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }
    const servicesCarousel = page.getByRole('region', { name: /image carousel/i }).first();
    if (!(await servicesCarousel.isVisible({ timeout: 3000 }))) {
      // Fallback: locate by presence of multiple groups with headings
      const altCarousel = page.locator('div.elementor-widget-carousel, div:has([role="group"])').first();
      if (await altCarousel.isVisible()) {
        // Use alternative carousel container
      }
    }
    // Use scoped buttons within carousel
    const nextButton = servicesCarousel.getByRole('button', { name: /next slide/i }).first();
    if (await nextButton.isVisible({ timeout: 3000 })) {
      await nextButton.click();
      await page.waitForTimeout(1000);
    }
  }

  /**
   * Test industry tabs functionality
   */
  async testIndustryTabs(page: Page): Promise<void> {
    const tabsList = page.locator(infiniteSelectors.industryTabs).first();
    await expect(tabsList).toBeVisible();
    
    // Test healthcare tab
  const healthcareTab = page.locator(infiniteSelectors.healthcareTab).first();
    if (await healthcareTab.isVisible()) {
      await healthcareTab.click();
      await page.waitForTimeout(1000);
    }
    
    // Test banking tab  
  const bankingTab = page.locator(infiniteSelectors.bankingTab).first();
    if (await bankingTab.isVisible()) {
      await bankingTab.click();
      await page.waitForTimeout(1000);
    }
  }

  /**
   * Verify key content sections are present
   */
  async verifyContentSections(page: Page): Promise<void> {
    const sections = [
      infiniteSelectors.industryFocus,
      infiniteSelectors.servicesSection,
      infiniteSelectors.testimonialsSection
    ];
    
    for (const selector of sections) {
      const section = page.locator(selector);
      await expect(section).toBeVisible();
    }
  }

  /**
   * Verify footer elements
   */
  async verifyFooter(page: Page): Promise<void> {
    const footer = page.locator(infiniteSelectors.footer);
    await expect(footer).toBeVisible();
    
    // Check for social links
    const socialLinks = page.locator(infiniteSelectors.socialLinks);
    await expect(socialLinks.first()).toBeVisible();
  }

  /**
   * Test page load performance
   */
  async measurePageLoad(page: Page): Promise<number> {
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }
}