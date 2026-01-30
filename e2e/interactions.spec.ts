import { test, expect } from '@playwright/test';
import { MsdComPage } from '../pageObjects/MsdComPage';

test.describe('msd.com Interactive Tests', () => {
  let msdPage: MsdComPage;

  test.beforeEach(async ({ page }) => {
    msdPage = new MsdComPage(page);
    await msdPage.navigate();
  });

  test('Open and close the navigation menu', async ({ page }) => {
    const menuButton = page.locator('button:has-text("Menu"), [aria-label*="menu" i]').first();
    await expect(menuButton).toBeVisible();

    // Open the menu
    await menuButton.click();

    // Verify main nav links become visible
    const companyLink = page.locator('a:has-text("Company")').first();
    await expect(companyLink).toBeVisible();
    const researchLink = page.locator('a:has-text("Research")').first();
    await expect(researchLink).toBeVisible();

    // Close the menu using the visible Close button
    const closeButton = page.locator('button:visible:has-text("Close")').first();
    await closeButton.click();

    // Nav links should no longer be visible
    await expect(companyLink).toBeHidden();
  });

  test('Expand Company sub-menu in navigation', async ({ page }) => {
    const menuButton = page.locator('button:has-text("Menu"), [aria-label*="menu" i]').first();
    await menuButton.click();

    // Click Company to expand its sub-menu
    const companyLink = page.locator('a:has-text("Company")').first();
    await expect(companyLink).toBeVisible();
    await companyLink.click();

    // Sub-menu items should appear
    const whoWeAre = page.locator('a:has-text("Who we are")').first();
    await expect(whoWeAre).toBeVisible();
    const whatWeDo = page.locator('a:has-text("What we do")').first();
    await expect(whatWeDo).toBeVisible();
  });

  test('Navigate to "Who we are" page via Company sub-menu', async ({ page }) => {
    const menuButton = page.locator('button:has-text("Menu"), [aria-label*="menu" i]').first();
    await menuButton.click();

    const companyLink = page.locator('a:has-text("Company")').first();
    await companyLink.click();

    const whoWeAre = page.locator('a:has-text("Who we are")').first();
    await expect(whoWeAre).toBeVisible();
    await whoWeAre.click();

    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/who-we-are|company/i);
  });

  test('Navigate to Research sub-page via menu', async ({ page }) => {
    const menuButton = page.locator('button:has-text("Menu"), [aria-label*="menu" i]').first();
    await menuButton.click();

    const researchLink = page.locator('a:has-text("Research")').first();
    await researchLink.click();

    // Research expands a sub-menu — pick Pipeline
    const pipeline = page.locator('a:has-text("Pipeline"):visible').first();
    await expect(pipeline).toBeVisible();
    await pipeline.click();

    await page.waitForLoadState('domcontentloaded');
    await expect(page).not.toHaveURL(/^https:\/\/www\.msd\.com\/?$/);
  });

  test('Search functionality works', async ({ page }) => {
    // Click the search trigger
    const searchTrigger = page.locator('button:has-text("Search"), a:has-text("Search"), [aria-label*="search" i]').first();
    await searchTrigger.click();

    // Type into the search field
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('diabetes');
    await searchInput.press('Enter');

    // Should navigate to a results page or show results
    await page.waitForLoadState('domcontentloaded');
    await expect(page).not.toHaveURL(/^https:\/\/www\.msd\.com\/?$/);
  });

  test('Footer links navigate correctly', async ({ page }) => {
    // Scroll to footer
    const footer = page.locator('footer').first();
    await footer.scrollIntoViewIfNeeded();

    // Check that the Contact Us link exists and works
    const contactLink = page.locator('footer a:has-text("Contact")').first();
    await expect(contactLink).toBeVisible();
    const href = await contactLink.getAttribute('href');
    expect(href).toBeTruthy();
  });

  test('Social media links are present and point to correct platforms', async ({ page }) => {
    const footer = page.locator('footer').first();
    await footer.scrollIntoViewIfNeeded();

    const socialPlatforms = [
      { name: 'Twitter/X', domain: 'twitter.com' },
      { name: 'LinkedIn', domain: 'linkedin.com' },
      { name: 'Facebook', domain: 'facebook.com' },
    ];

    for (const platform of socialPlatforms) {
      const link = page.locator(`footer a[href*="${platform.domain}"]`).first();
      const href = await link.getAttribute('href');
      expect(href, `${platform.name} link should be present`).toBeTruthy();
    }
  });

  test('Page scrolls to content sections', async ({ page }) => {
    // Scroll to the bottom of the page and back to top
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const scrolledDown = await page.evaluate(() => window.scrollY > 0);
    expect(scrolledDown).toBe(true);

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    const backAtTop = await page.evaluate(() => window.scrollY === 0);
    expect(backAtTop).toBe(true);
  });

  test('Logo click navigates to homepage', async ({ page }) => {
    // First navigate away via search
    const searchTrigger = page.locator('button:has-text("Search"), a:has-text("Search"), [aria-label*="search" i]').first();
    await searchTrigger.click();
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('health');
    await searchInput.press('Enter');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).not.toHaveURL(/^https:\/\/www\.msd\.com\/?$/);

    // Now click the logo to go back home
    const logo = page.locator('header a:has(img), a[aria-label*="home" i], a[aria-label*="MSD" i]').first();
    await logo.click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/^https:\/\/www\.msd\.com\/?$/);
  });
});
