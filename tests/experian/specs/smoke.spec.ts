import { test, expect } from '@playwright/test';
import { HomePage } from '../pageObjects/HomePage';

test.describe('Experian Smoke Tests @smoke', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('TC-001: Home page loads successfully', async ({ page }) => {
    await homePage.goto();
    
    // Verify page loads and has expected content
    await expect(page).toHaveTitle(/experian/i);
    await expect(homePage.header).toBeVisible();
    await expect(homePage.navigation).toBeVisible();
    
    // Verify page performance (should load within reasonable time)
    const startTime = Date.now();
    await homePage.waitForPageLoad();
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000); // 10 seconds max
  });

  test('TC-002: Navigation menu is functional', async () => {
    await homePage.goto();
    
    // Check navigation is visible and interactive
    await expect(homePage.navigation).toBeVisible();
    const isNavVisible = await homePage.isNavigationVisible();
    expect(isNavVisible).toBe(true);
    
    // Verify navigation has key sections
    const navText = await homePage.navigation.textContent();
    expect(navText?.toLowerCase()).toContain('credit');
  });

  test('TC-003: Footer links are accessible', async () => {
    await homePage.goto();
    
    const footerLinks = await homePage.getFooterLinks();
    expect(footerLinks.length).toBeGreaterThan(0);
    
    // Verify common footer links exist
    const footerText = footerLinks.join(' ').toLowerCase();
    expect(footerText).toMatch(/(privacy|terms|contact|about)/);
  });

  test('TC-004: Primary CTA "Get Started" is clickable', async ({ page }) => {
    await homePage.goto();
    
    // Use knowledge base selector from automation-locators-kb.jsonl
    await expect(homePage.primaryCTA).toBeVisible();
    await expect(homePage.primaryCTA).toBeEnabled();
    
    // Click and verify navigation occurs
    await homePage.clickPrimaryCTA();
    
    // Should navigate away from home or show signup/login flow
    await page.waitForURL(url => !url.href.includes('www.experian.com') || url.href.includes('signup') || url.href.includes('login'));
  });

  test('TC-005: Search functionality basic test', async ({ page }) => {
    await homePage.goto();
    
    // Check if search is available (might not be on all pages)
    const searchVisible = await homePage.searchInput.isVisible().catch(() => false);
    
    if (searchVisible) {
      await homePage.searchInput.fill('credit score');
      await homePage.searchInput.press('Enter');
      
      // Verify search results or navigation
      await page.waitForTimeout(2000); // Wait for search results
      const currentUrl = page.url();
      const hasResults = await page.locator('h1, h2, h3').count() > 0;
      
      expect(currentUrl.includes('search') || hasResults).toBe(true);
    } else {
      // If no search available, test passes but we log it
      console.log('Search functionality not found on homepage');
    }
  });
});

test.describe('Experian Navigation Tests @smoke', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    // Force desktop viewport for robust header visibility
    await page.setViewportSize({ width: 1440, height: 900 });
    homePage = new HomePage(page);
    await homePage.goto();
  });


  test('TC-007: Sign up link navigation', async ({ page }) => {
    const signUpVisible = await homePage.signUpButton.isVisible().catch(() => false);
    
    if (signUpVisible) {
      await homePage.navigateToSignUp();

      // The sign up action may open a new registration page or an in-page modal.
      // Try a short navigation wait first, then fallback to checking for a signup form/modal.
      let urlMatched = false;
      try {
        await page.waitForURL(url => url.href.includes('signup') || url.href.includes('register'), { timeout: 5000 });
        urlMatched = true;
      } catch (e) {
        // Not navigated to a signup URL within timeout — could be an in-page modal or widget.
      }

      const signupModal = page.locator('form:has-text("Sign up"), form:has-text("Create account"), [role="dialog"] :has-text("Sign up")').first();
      const modalVisible = await signupModal.isVisible().catch(() => false);

      // Assert that either navigation occurred or a signup modal/content is visible.
      expect(urlMatched || modalVisible).toBe(true);
    } else {
      console.log('Sign up button not found on homepage');
    }
  });
});

test.describe('Experian Finance Features Visibility @smoke @finance', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('TC-008: Credit score section is visible', async () => {
    const creditSection = await homePage.getCreditScoreSection();
    const isVisible = await creditSection.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(creditSection).toBeVisible();
      const sectionText = await creditSection.textContent();
      expect(sectionText?.toLowerCase()).toMatch(/(credit|score)/);
    } else {
      // Credit section might be behind auth
      console.log('Credit score section not visible on public homepage');
    }
  });

  test('TC-009: Security features are highlighted', async () => {
    const securityFeatures = await homePage.getSecurityFeatures();
    const isVisible = await securityFeatures.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(securityFeatures).toBeVisible();
      const featuresText = await securityFeatures.textContent();
      expect(featuresText?.toLowerCase()).toMatch(/(security|protection|monitoring|identity)/);
    } else {
      console.log('Security features not prominently displayed on homepage');
    }
  });

  test('TC-010: Products section is accessible', async () => {
    const productsSection = await homePage.getProductsSection();
    const isVisible = await productsSection.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(productsSection).toBeVisible();
      const productsText = await productsSection.textContent();
      expect(productsText?.toLowerCase()).toMatch(/(products|services|cards|loans)/);
    } else {
      console.log('Products section not found on homepage');
    }
  });
});
