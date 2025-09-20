import { test, expect } from '@playwright/test';

test.describe('ResortPass Smoke Tests', () => {
  test('should load homepage successfully @smoke', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load - use domcontentloaded instead of networkidle for faster, more reliable tests
    await page.waitForLoadState('domcontentloaded');
    
    // Check basic page elements
    await expect(page).toHaveTitle(/ResortPass/);
    
    // Check for search button (use .first() to avoid strict mode violation)
    const searchButton = page.getByRole('button', { name: /search/i }).first();
    await expect(searchButton).toBeVisible({ timeout: 10000 });
    
    // Check for logo - updated selector based on investigation
    const logo = page.getByRole('link', { name: 'Resortpass logo' });
    await expect(logo).toBeVisible({ timeout: 10000 });
  });

  test('should display search form elements @smoke', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Check for location search element - use role-based selector
    const locationSearch = page.getByRole('button', { name: 'Where to?' });
    await expect(locationSearch).toBeVisible({ timeout: 10000 });
    
    // Check for search button (use .first() to avoid strict mode violation)
    const searchButton = page.getByRole('button', { name: /search/i }).first();
    await expect(searchButton).toBeVisible({ timeout: 10000 });
  });

  test('should click on location search element @smoke', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Click on location search
    const locationButton = page.getByRole('button', { name: 'Where to?' });
    if (await locationButton.isVisible()) {
      await locationButton.click();
      
      // Check if a modal or dropdown appears
      await page.waitForTimeout(1000);
      
      // Look for location suggestions
      const locationSuggestions = page.locator('button:has-text("Miami"), button:has-text("Orlando"), button:has-text("Phoenix")');
      await expect(locationSuggestions.first()).toBeVisible({ timeout: 5000 });
    }
  });
});
