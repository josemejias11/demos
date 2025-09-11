import { test, expect } from '@playwright/test';
import { HomePage } from '../pageObjects/HomePage';

test.describe('Experian Live Site Validation', () => {
  test('TC-004: Primary CTA validation against real site', async ({ page }) => {
    // Direct navigation to Experian.com  
    await page.goto('https://www.experian.com');
    await page.waitForLoadState('domcontentloaded');
    
    // Use the corrected selector from debug findings
    const primaryCTA = page.locator('a:has-text("Get started")').first();
    
    await test.step('Wait for page to load completely', async () => {
      // Skip networkidle due to analytics scripts that never settle
      await page.waitForTimeout(3000);
      await expect(page.locator('h1')).toBeVisible();
    });
    
    await test.step('Verify Primary CTA is visible and clickable', async () => {
      await expect(primaryCTA).toBeVisible({ timeout: 15000 });
      await expect(primaryCTA).toBeEnabled();
      
      // Verify the text content (apostrophe may be different character)
      const ctaText = await primaryCTA.textContent();
      console.log('CTA Text:', JSON.stringify(ctaText));
      expect(ctaText?.trim()).toContain("get started");
    });
    
    await test.step('Test CTA interaction', async () => {
      await primaryCTA.click();
      
      // Should navigate to registration page (we expect Incapsula blocking)
      await page.waitForTimeout(3000);
      const currentUrl = page.url();
      console.log('Current URL after CTA click:', currentUrl);
      
      // Validate we navigated away or got blocked (both are expected behaviors)
      const isBlocked = await page.locator('text=Incapsula').isVisible().catch(() => false);
      const isRegistration = currentUrl.includes('registration') || currentUrl.includes('signup');
      
      expect(isBlocked || isRegistration).toBe(true);
    });
  });
  
  test('Navigation structure validation', async ({ page }) => {
    const homePage = new HomePage(page);
    await page.goto('https://www.experian.com');
    await page.waitForLoadState('domcontentloaded');
    
    await test.step('Validate main navigation buttons', async () => {
      const navButtons = await homePage.getAllNavigationButtons();
      
      await expect(navButtons.credit).toBeVisible();
      await expect(navButtons.protection).toBeVisible();
      await expect(navButtons.money).toBeVisible();
      await expect(navButtons.creditCards).toBeVisible();
      await expect(navButtons.loans).toBeVisible();
      await expect(navButtons.insurance).toBeVisible();
    });
    
    await test.step('Test Credit dropdown functionality', async () => {
      await homePage.navigateToCredit();
      
      // Wait for dropdown to expand
      await page.waitForTimeout(1000);
      
      // Verify dropdown is expanded
      const isExpanded = await homePage.isDropdownExpanded('Credit');
      expect(isExpanded).toBe(true);
      
      // Verify dropdown contains expected links
      const dropdownLinks = await homePage.getCreditDropdownLinks();
      await expect(dropdownLinks.first()).toBeVisible();
    });
  });
});
