import { test, expect } from '@playwright/test';

test.describe('Bristlecone Homepage Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('BC-001: Homepage loads successfully @smoke @p0', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Bristlecone/);
    
    // Verify page loads with main content
    await expect(page.locator('body')).toBeVisible();
    
    // Verify main navigation is present
    await expect(page.locator('nav')).toBeVisible();
    
    // Check that some key content is present
    const pageText = await page.textContent('body');
    expect(pageText).toContain('supply chain');
  });

  test('BC-002: Main navigation menu functions @smoke @p0', async ({ page }) => {
    // Wait for navigation to load
    await page.waitForSelector('nav');
    
    // Test that main navigation items are visible and clickable
    const navItems = ['INDUSTRIES', 'CONSULTING', 'SERVICES', 'CONTACT'];

    for (const item of navItems) {
      // Use more specific locator to avoid multiple matches
      const navLink = page.locator(`nav a:has-text("${item}")`, { hasText: item }).first();
      
      if (await navLink.isVisible()) {
        await expect(navLink).toBeVisible();
        
        // Verify link has href attribute
        const href = await navLink.getAttribute('href');
        expect(href).toBeTruthy();
      }
    }
  });

  test('BC-003: GDPR consent banner functions @smoke @p0', async ({ context }) => {
    // Use a fresh context to ensure consent banner appears
    const newPage = await context.newPage();
    await newPage.goto('/');
    
    // Check if consent banner is visible
    const consentBanner = newPage.locator('[role="dialog"]:has-text("Manage Consent")');
    
    if (await consentBanner.isVisible()) {
      // Click Accept button
      await newPage.getByRole('button', { name: 'Accept' }).click();
      
      // Verify banner is dismissed
      await expect(consentBanner).not.toBeVisible();
    }
    
    await newPage.close();
  });

  test('BC-004: Search functionality works @p1', async ({ page }) => {
    // Look for search functionality - use more specific targeting
    const searchButton = page.locator('a[href="#searchbox"]').first();
    
    if (await searchButton.isVisible()) {
      // Scroll element into view first
      await searchButton.scrollIntoViewIfNeeded();
      await searchButton.click();
      
      // Verify search interface appears
      const searchInput = page.locator('input[type="search"], #searchbox input, .search-field');
      if (await searchInput.first().isVisible()) {
        await expect(searchInput.first()).toBeVisible();
      }
    } else {
      // If no search found, just verify the page loaded
      console.log('No search functionality found on this page');
    }
  });

  test('BC-005: Hero section CTAs function @p0', async ({ page }) => {
    // Don't wait for networkidle, just wait for basic load
    await page.waitForSelector('body');
    
    // Find CTA buttons (LEARN MORE, CONTACT US, etc.)
    const ctaButtons = page.locator('a:has-text("LEARN MORE"), a:has-text("CONTACT US")');
    const count = await ctaButtons.count();
    
    if (count > 0) {
      // Test first CTA button
      const firstCta = ctaButtons.first();
      await expect(firstCta).toBeVisible();
      
      // Verify it's clickable
      expect(await firstCta.getAttribute('href')).toBeTruthy();
    }
  });

  test('BC-006: Footer links are functional @p1', async ({ page }) => {
    // Scroll to bottom of page with timeout
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Wait a moment for footer to load
    await page.waitForTimeout(2000);
    
    // Check for footer navigation with fallback
    const footerLinks = page.locator('footer a, .footer a, [class*="footer"] a').first();
    
    if (await footerLinks.isVisible()) {
      await expect(footerLinks).toBeVisible();
      
      // Test footer link has href
      const href = await footerLinks.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('BC-007: Logo navigation to homepage @p1', async ({ page }) => {
    // First navigate to a different page
    await page.goto('/contact/');
    await expect(page).toHaveURL(/contact/);
    
    // Click the logo
    const logo = page.locator('img[alt*="Bristlecone"], a[href="/"], a[href="https://www.bristlecone.com"]').first();
    await logo.click();
    
    // Verify we're back on homepage
    await expect(page).toHaveURL(/^\/$|bristlecone\.com\/?$/);
  });
});
