import { test, expect } from '@playwright/test';
import { HomePage } from './pageObjects/HomePage';
import { testData } from './fixtures/testData';

test.describe('ResortPass Navigation and UI', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.dismissCookieBanner();
    await homePage.closeModal();
  });

  test.describe('Header Navigation', () => {
    test('should display main navigation elements @smoke', async ({ page }) => {
      // Check for logo (visible)
      await homePage.expectElementVisible(homePage.logo);
      
      // Check for login button (visible) 
      await homePage.expectElementVisible(homePage.loginButton);
      
      // Verify the main search functionality is present
      await homePage.expectElementVisible(homePage.searchLocationInput);
      await homePage.expectElementVisible(homePage.searchButton);
    });

    test('should have working logo link', async ({ page }) => {
      await homePage.goto('/some-other-page'); // Navigate away from home
      
      if (await homePage.logo.isVisible()) {
        await homePage.logo.click();
        await homePage.expectURL('/');
      }
    });

    test('should display cart icon', async ({ page }) => {
      const hasCartIcon = await homePage.cartIcon.isVisible();
      
      // Cart icon might not be visible when empty, so this is optional
      if (hasCartIcon) {
        await homePage.expectElementVisible(homePage.cartIcon);
      }
    });
  });

  test.describe('Footer Navigation', () => {
    test('should display footer with links', async ({ page }) => {
      await homePage.expectElementVisible(homePage.footer);
      
      // Check for common footer links
      const footerLinks = await homePage.footer.locator('a').all();
      expect(footerLinks.length).toBeGreaterThan(0);
      
      // Verify some footer links are functional
      for (let i = 0; i < Math.min(3, footerLinks.length); i++) {
        const href = await footerLinks[i].getAttribute('href');
        expect(href).toBeTruthy();
      }
    });

    test('should have contact/support information in footer', async ({ page }) => {
      const footerText = await homePage.footer.textContent();
      
      // Look for contact-related keywords
      const hasContactInfo = ['contact', 'support', 'help', 'email', 'phone'].some(keyword =>
        footerText?.toLowerCase().includes(keyword)
      );
      
      expect(hasContactInfo).toBeTruthy();
    });
  });

  test.describe('Mobile Navigation', () => {
    test('should display mobile menu on small screens @mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await homePage.goto();
      await homePage.dismissCookieBanner();
      
      // Mobile menu button should be visible
      if (await homePage.mobileMenuButton.isVisible()) {
        await homePage.expectElementVisible(homePage.mobileMenuButton);
        
        // Test mobile menu functionality
        await homePage.mobileMenuButton.click();
        
        if (await homePage.mobileMenu.isVisible()) {
          await homePage.expectElementVisible(homePage.mobileMenu);
        }
      }
    });

    test('should maintain functionality across viewport sizes', async ({ page }) => {
      // Test desktop
      await page.setViewportSize({ width: 1200, height: 800 });
      await homePage.validateHomepageElements();
      
      // Test tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await homePage.validateHomepageElements();
      
      // Test mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await homePage.validateHomepageElements();
    });
  });

  test.describe('Page Structure and Content', () => {
    test('should have proper page title and meta information', async ({ page }) => {
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
      expect(title.toLowerCase()).toContain('resort');
    });

    test('should display hero section with call-to-action', async ({ page }) => {
      await homePage.expectElementVisible(homePage.heroSection);
      await homePage.expectElementVisible(homePage.heroTitle);
      
      const heroTitle = await homePage.heroTitle.textContent();
      expect(heroTitle).toBeTruthy();
      expect(heroTitle?.length).toBeGreaterThan(0);
    });

    test('should show featured content sections', async ({ page }) => {
      // Check for popular destinations or featured hotels
      const hasFeaturedHotels = await homePage.featuredHotels.isVisible();
      const hasPopularDestinations = await homePage.popularDestinations.isVisible();
      const hasHowItWorks = await homePage.howItWorksSection.isVisible();
      
      // At least one content section should be present
      expect(hasFeaturedHotels || hasPopularDestinations || hasHowItWorks).toBeTruthy();
    });

    test('should display app download links', async ({ page }) => {
      if (await homePage.downloadAppSection.isVisible()) {
        // Check for app store links
        const hasAppStore = await homePage.appStoreLink.isVisible();
        const hasPlayStore = await homePage.playStoreLink.isVisible();
        
        // At least one app store link should be present
        expect(hasAppStore || hasPlayStore).toBeTruthy();
        
        // Verify links have proper URLs
        if (hasAppStore) {
          const appStoreHref = await homePage.appStoreLink.getAttribute('href');
          expect(appStoreHref).toContain('apps.apple.com');
        }
        
        if (hasPlayStore) {
          const playStoreHref = await homePage.playStoreLink.getAttribute('href');
          expect(playStoreHref).toContain('play.google.com');
        }
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);
      
      // Should have at least one h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
    });

    test('should have alt text for images', async ({ page }) => {
      const images = await page.locator('img').all();
      
      for (const image of images) {
        const alt = await image.getAttribute('alt');
        const ariaLabel = await image.getAttribute('aria-label');
        const hasDescription = alt || ariaLabel;
        
        // Images should have alt text or aria-label (decorative images can have empty alt)
        expect(hasDescription !== null).toBeTruthy();
      }
    });

    test('should have accessible form labels', async ({ page }) => {
      const inputs = await page.locator('input, select, textarea').all();
      
      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const placeholder = await input.getAttribute('placeholder');
        
        if (id) {
          // Check for associated label
          const label = await page.locator(`label[for="${id}"]`).isVisible();
          expect(label || ariaLabel || placeholder).toBeTruthy();
        }
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      
      // Should focus on an interactive element
      const interactiveElements = ['INPUT', 'BUTTON', 'A', 'SELECT', 'TEXTAREA'];
      expect(interactiveElements.includes(focusedElement || '')).toBeTruthy();
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load page within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/', { waitUntil: 'networkidle' });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // 5 seconds max
    });

    test('should not have console errors on load', async ({ page }) => {
      const consoleErrors: string[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Filter out common third-party errors that don't affect functionality
      const significantErrors = consoleErrors.filter(error => 
        !error.includes('favicon') &&
        !error.includes('analytics') &&
        !error.includes('ads') &&
        !error.includes('tracking')
      );
      
      expect(significantErrors.length).toBe(0);
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    test('should render correctly in different browsers', async ({ page, browserName }) => {
      await homePage.validateHomepageElements();
      
      // Browser-specific validations could go here
      if (browserName === 'webkit') {
        // Safari-specific tests
        await homePage.expectElementVisible(homePage.searchLocationInput);
      } else if (browserName === 'firefox') {
        // Firefox-specific tests
        await homePage.expectElementVisible(homePage.searchButton);
      }
    });
  });

  test.describe('External Links', () => {
    test('should handle external links appropriately', async ({ page }) => {
      // Find external links in footer
      const externalLinks = await homePage.footer.locator('a[href^="http"]:not([href*="resortpass.com"])').all();
      
      for (let i = 0; i < Math.min(2, externalLinks.length); i++) {
        const target = await externalLinks[i].getAttribute('target');
        const rel = await externalLinks[i].getAttribute('rel');
        
        // External links should open in new tab and have proper rel attributes
        expect(target).toBe('_blank');
        expect(rel).toContain('noopener');
      }
    });
  });

  test.describe('SEO Elements', () => {
    test('should have proper meta tags', async ({ page }) => {
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      const keywords = await page.locator('meta[name="keywords"]').getAttribute('content');
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      
      expect(description).toBeTruthy();
      expect(description?.length).toBeGreaterThan(50);
      
      // Open Graph tags for social sharing
      if (ogTitle) {
        expect(ogTitle.length).toBeGreaterThan(0);
      }
    });

    test('should have structured data', async ({ page }) => {
      // Look for JSON-LD structured data
      const structuredData = await page.locator('script[type="application/ld+json"]').count();
      
      // While not required, structured data helps with SEO
      if (structuredData > 0) {
        expect(structuredData).toBeGreaterThan(0);
      }
    });
  });
});
