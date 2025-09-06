import { test, expect } from '@playwright/test';

test.describe('ResortPass Smoke Tests', () => {
  test('should load homepage successfully @smoke', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check basic page elements
    await expect(page).toHaveTitle(/ResortPass/);
    
    // Check for search button
    const searchButton = page.getByRole('button', { name: /search/i });
    await expect(searchButton).toBeVisible({ timeout: 10000 });
    
    // Check for logo
    const logo = page.locator('img[alt*="ResortPass"]').first();
    await expect(logo).toBeVisible({ timeout: 10000 });
  });

  test('should display search form elements @smoke', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Dismiss cookie banner if present
    const cookieBanner = page.locator('[aria-label*="cookie"], .cookie-banner');
    if (await cookieBanner.isVisible()) {
      const acceptButton = cookieBanner.getByRole('button', { name: 'Accept All Cookies' });
      if (await acceptButton.isVisible()) {
        await acceptButton.click();
        await cookieBanner.waitFor({ state: 'hidden' });
      }
    }
    
    // Check for location search element (button or input)
    const locationSearch = page.locator('button:has-text("Where to?"), input[placeholder*="location"], combobox');
    await expect(locationSearch.first()).toBeVisible({ timeout: 10000 });
    
    // Check for search button
    const searchButton = page.getByRole('button', { name: /search/i });
    await expect(searchButton).toBeVisible({ timeout: 10000 });
  });

  test('should click on location search element @smoke', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Dismiss cookie banner
    const cookieBanner = page.locator('[aria-label*="cookie"], .cookie-banner');
    if (await cookieBanner.isVisible()) {
      const acceptButton = cookieBanner.getByRole('button', { name: 'Accept All Cookies' });
      if (await acceptButton.isVisible()) {
        await acceptButton.click();
        await cookieBanner.waitFor({ state: 'hidden' });
      }
    }
    
    // Click on location search
    const locationButton = page.locator('button:has-text("Where to?")');
    if (await locationButton.isVisible()) {
      await locationButton.click();
      
      // Check if a modal or dropdown appears
      await page.waitForTimeout(1000);
      
      // Take a screenshot to see what happens
      await page.screenshot({ path: 'test-results/location-click.png' });
    }
  });
});
