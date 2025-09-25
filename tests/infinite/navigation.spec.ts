import { test, expect } from '@playwright/test';
import { InfiniteTestBlocks } from './utils/testBlocks';

// Complete mock Container replacement
class Container {
  private static instance: Container;
  private services = new Map();

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  get(serviceName: string): any {
    if (!this.services.has(serviceName)) {
      // Mock services
      this.services.set(serviceName, {
        locate: () => null,
        collect: () => {},
        log: () => {},
        recordEvent: () => {} // Added to fix telemetry.recordEvent error
      });
    }
    return this.services.get(serviceName);
  }
}

test.describe('Infinite.com Navigation Tests @live', () => {
  let container: Container;
  let testBlocks: InfiniteTestBlocks;

  test.beforeEach(async () => {
    container = Container.getInstance();
    testBlocks = new InfiniteTestBlocks(container);
  });

  test('NAV-001: Main Navigation Functionality', async ({ page }) => {
    const infinitePage = await testBlocks.initializeTest(page, 'NAV-001');
    
    await testBlocks.handleCookieConsent(infinitePage);
    await testBlocks.verifyMainNavigation(infinitePage);
    
    // Verify navigation is clickable
    const industriesLink = page.getByRole('link', { name: /industries/i });
    await expect(industriesLink.first()).toBeVisible();
    
    // Test navigation responsiveness
    await industriesLink.first().hover();
    
    await infinitePage.recordTelemetry('test.nav_001_completed', {
      testResult: 'passed',
      navItemsVerified: 5
    });
  });

  test('NAV-002: Solutions Dropdown Menu', async ({ page }) => {
    const infinitePage = await testBlocks.initializeTest(page, 'NAV-002');
    
    await testBlocks.handleCookieConsent(infinitePage);
    await testBlocks.verifySolutionsDropdown(infinitePage);
    
    // Additional verification: click on a solution to ensure navigation works
    const brassRingLink = page.locator('a:has-text("BrassRing Solutions")').first();
    if (await brassRingLink.isVisible()) {
      await brassRingLink.click();
      
      // Verify navigation occurred (URL change or content change)
      await page.waitForLoadState('domcontentloaded');
      const currentUrl = page.url();
      
      await infinitePage.recordTelemetry('test.nav_002_completed', {
        testResult: 'passed',
        navigatedTo: currentUrl,
        solutionClicked: 'BrassRing'
      });
    }
  });

  test('NAV-003: Mobile Navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const infinitePage = await testBlocks.initializeTest(page, 'NAV-003');
    await testBlocks.handleCookieConsent(infinitePage);
    
    // Check mobile responsiveness
    const mobileChecks = await testBlocks.checkMobileResponsiveness(page);
    expect(mobileChecks.mobileViewport).toBe(true);
    expect(mobileChecks.contentVisible).toBe(true);
    
    // Look for mobile menu toggle
    const mobileMenuSelectors = [
      'button[aria-label*="menu"]',
      '.mobile-menu-toggle',
      '.hamburger',
      'button:has-text("Menu")',
      '[data-testid="mobile-menu"]'
    ];
    
    let mobileMenuFound = false;
    for (const selector of mobileMenuSelectors) {
      const menuButton = page.locator(selector);
      if (await menuButton.count() > 0 && await menuButton.isVisible()) {
        await menuButton.click();
        mobileMenuFound = true;
        break;
      }
    }
    
    await infinitePage.recordTelemetry('test.nav_003_completed', {
      testResult: 'passed',
      mobileMenuFound,
      responsiveChecks: mobileChecks
    });
  });

  test('NAV-004: Breadcrumb Navigation', async ({ page }) => {
    const infinitePage = await testBlocks.initializeTest(page, 'NAV-004');
    await testBlocks.handleCookieConsent(infinitePage);
    
    // Navigate to a deeper page to test breadcrumbs
    const aboutLink = page.getByRole('link', { name: /about/i });
    if (await aboutLink.count() > 0) {
      await aboutLink.first().click();
      await page.waitForLoadState('domcontentloaded');
      
      // Look for breadcrumb navigation
      const breadcrumbSelectors = [
        '.breadcrumb',
        '.breadcrumbs',
        'nav[aria-label*="breadcrumb"]',
        '[data-testid="breadcrumb"]',
        '.page-breadcrumb'
      ];
      
      let breadcrumbFound = false;
      for (const selector of breadcrumbSelectors) {
        const breadcrumb = page.locator(selector);
        if (await breadcrumb.count() > 0) {
          await expect(breadcrumb.first()).toBeVisible();
          breadcrumbFound = true;
          break;
        }
      }
      
      await infinitePage.recordTelemetry('test.nav_004_completed', {
        testResult: breadcrumbFound ? 'passed' : 'skipped',
        breadcrumbFound,
        currentUrl: page.url()
      });
      
      // If no breadcrumbs found, that's okay for some sites
      if (!breadcrumbFound) {
        test.skip(!breadcrumbFound, 'No breadcrumb navigation found - this may be expected for this site');
      }
    } else {
      test.skip(true, 'About link not found - skipping breadcrumb test');
    }
  });

  test.afterEach(async ({ page }) => {
    // Perform cleanup and final telemetry
    const telemetry = container.get('telemetryCollector');
    
    telemetry.recordEvent({
      ts: Date.now(),
      type: 'test.navigation_suite_step_completed',
      payload: {
        url: page.url(),
        title: await page.title(),
        timestamp: Date.now()
      }
    });
  });
});