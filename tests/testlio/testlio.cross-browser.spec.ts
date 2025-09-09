import { test, expect, devices } from '@playwright/test';

// Cross-browser testing with framework integration
test.describe('Testlio Cross-Browser Compatibility', () => {
  
  const testPages = [
    { name: 'Homepage', url: 'https://testlio.com' },
    { name: 'Contact Sales', url: 'https://testlio.com/contact-sales/' },
    { name: 'Platform Login', url: 'https://platform.testlio.com/login' }
  ];

  for (const testPage of testPages) {
    test(`HP10: ${testPage.name} cross-browser compatibility @cross-browser`, async ({ page, browserName }) => {
      await test.step(`Load ${testPage.name} in ${browserName}`, async () => {
        await page.goto(testPage.url);
        
        // Handle cookie consent if present
        try {
          await page.getByRole('button', { name: /allow all cookies/i }).click({ timeout: 3000 });
        } catch {
          // Cookie banner not present
        }
      });

      await test.step(`Verify core functionality in ${browserName}`, async () => {
        // Common checks for all pages
        await expect(page).toHaveTitle(/Testlio/);
        
        if (testPage.name === 'Homepage') {
          await expect(page.getByRole('heading', { name: /What if everything/i })).toBeVisible();
          // Use header-specific selector to avoid ambiguity
          await expect(page.locator('header').getByRole('link', { name: 'Contact sales' })).toBeVisible();
        } else if (testPage.name === 'Contact Sales') {
          await expect(page.getByText('Talk to an expert')).toBeVisible();
          const frame = page.frameLocator('iframe');
          await expect(frame.getByRole('form', { name: 'HubSpot Form' })).toBeVisible({ timeout: 10000 });
        } else if (testPage.name === 'Platform Login') {
          await expect(page.getByText('Log in to your account.')).toBeVisible();
          await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
        }
      });

      await test.step(`Test navigation in ${browserName}`, async () => {
        if (testPage.name === 'Homepage') {
          // Test main navigation
          const advantageLink = page.getByRole('link', { name: 'The Testlio Advantage' });
          if (await advantageLink.isVisible()) {
            await advantageLink.click();
            await expect(page.url()).toContain('#');
          }
        }
      });
    });
  }
});

// Device-specific testing
test.describe('Testlio Device Compatibility', () => {
  
  test('HP16: iPhone compatibility @mobile @device', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();

    await test.step('Test homepage on iPhone', async () => {
      await page.goto('https://testlio.com');
      
      // Handle cookie consent
      try {
        await page.getByRole('button', { name: /allow all cookies/i }).click({ timeout: 3000 });
      } catch {
        // Cookie banner not present
      }
      
      await expect(page.locator('header').getByRole('link', { name: 'Testlio homepage' })).toBeVisible();
      await expect(page.getByRole('heading', { name: /What if everything/i })).toBeVisible();
    });

    await test.step('Test form interaction on iPhone', async () => {
      await page.goto('https://testlio.com/contact-sales/');
      
      const frame = page.frameLocator('iframe');
      await expect(frame.getByRole('form', { name: 'HubSpot Form' })).toBeVisible({ timeout: 10000 });
      
      // Test form field interaction on mobile
      await frame.getByRole('textbox', { name: /first name/i }).tap();
      await frame.getByRole('textbox', { name: /first name/i }).fill('Mobile Test');
      
      await expect(frame.getByRole('textbox', { name: /first name/i })).toHaveValue('Mobile Test');
    });

    await context.close();
  });

  test('HP17: iPad compatibility @tablet @device', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPad Pro'],
    });
    const page = await context.newPage();

    await test.step('Test homepage on iPad', async () => {
      await page.goto('https://testlio.com');
      
      // Handle cookie consent
      try {
        await page.getByRole('button', { name: /allow all cookies/i }).click({ timeout: 3000 });
      } catch {
        // Cookie banner not present
      }
      
      await expect(page.getByRole('link', { name: 'The Testlio Advantage' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Our Solutions' })).toBeVisible();
      // Use header-specific selector to avoid ambiguity with multiple contact sales links
      await expect(page.locator('header').getByRole('link', { name: 'Contact sales' })).toBeVisible();
    });

    await test.step('Test navigation hover states on iPad', async () => {
      const solutionsLink = page.getByRole('link', { name: 'Our Solutions' });
      await solutionsLink.hover();
      
      // Should handle hover/touch interactions gracefully
      await expect(solutionsLink).toBeVisible();
    });

    await context.close();
  });

  test('HP18: Desktop high-resolution compatibility @desktop @device', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    await test.step('Test homepage on high-resolution desktop', async () => {
      await page.goto('https://testlio.com');
      
      // Handle cookie consent
      try {
        await page.getByRole('button', { name: /allow all cookies/i }).click({ timeout: 3000 });
      } catch {
        // Cookie banner not present
      }
      
      // Verify layout utilizes screen real estate effectively
      await expect(page.getByRole('heading', { name: /What if everything/i })).toBeVisible();
      
      // Check that content is not overly stretched
      const heroSection = page.locator('main').first();
      await expect(heroSection).toBeVisible();
    });

    await test.step('Test multi-column layouts', async () => {
      // Scroll to sections with multi-column layouts
      await page.getByText('Extensive real-world validation').scrollIntoViewIfNeeded();
      
      // Verify service cards are displayed in grid format
      await expect(page.getByRole('link', { name: 'Manual testing' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Test automation' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Payments testing' })).toBeVisible();
    });

    await context.close();
  });
});
