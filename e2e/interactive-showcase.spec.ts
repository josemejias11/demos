import { test, expect } from '@playwright/test';
import { TargetSitePage } from '../pageObjects/TargetSitePage';
import { setupPageGuards } from '../setup/global.setup';

test.describe('Demo Site Interactive Showcase', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await setupPageGuards(page, testInfo.title);
  });

  test('Visually navigate menus and click links', async ({ page }) => {
    // 1. Navigate to the homepage
    const targetSitePage = new TargetSitePage(page);
    await targetSitePage.navigate();

    // 2. We want to find the top-level navigation items. 
    // On many modern sites, the main navigation items have role="menuitem" or are links inside the header nav.
    // Let's use Playwright's robust locators to find them.
    
    // Attempt to locate the main header and its primary navigation buttons/links
    // This uses a resilient locator strategy to find top-level menu triggers.
    const header = page.locator('header').first();
    await expect(header).toBeVisible();

    // Use specific text matching for known top-level menu items.
    // Demo uses distinct text labels for its main dropdowns.
    const menuLabels = ['Products', 'Services', 'About Us'];
    
    for (const label of menuLabels) {
      // Find the menu trigger by text (could be a div, span, button, or link)
      const item = page.locator(`text="${label}"`).first();
      
      // Ensure the item is visible before trying to interact
      if (await item.isVisible()) {
        // --- VISUAL SHOWCASE EFFECT: Hover to open ---
        await item.hover();
        
        // Add a deliberate wait so the viewer can see the menu open
        await page.waitForTimeout(1500); 

        // Now find a link that is visible and likely in the dropdown.
        // We look for any visible link that is NOT one of our top-level triggers.
        const linksInMenu = page.locator('a[href]:visible').filter({ hasNotText: label });
        
        const linkCount = await linksInMenu.count();
        if (linkCount > 1) {
          // Pick a link inside the expanded menu
          const linkToClick = linksInMenu.nth(1);
          
          // --- VISUAL SHOWCASE EFFECT: Highlight ---
          // Draw a thick red border around it to show intent
          await linkToClick.evaluate(node => {
            // @ts-ignore
            node.style.border = '4px solid red';
            // @ts-ignore
            node.style.backgroundColor = 'yellow';
          });
          await page.waitForTimeout(1500); // Wait so the highlight is clearly seen
          
          // Click the link to open in a new tab using OS-specific modifier
          const modifierKey = process.platform === 'darwin' ? 'Meta' : 'Control';
          const [newPage] = await Promise.all([
            page.context().waitForEvent('page'),
            linkToClick.click({ modifiers: [modifierKey] })
          ]);
          
          // Bring new tab to front and wait for it to load
          await newPage.bringToFront();
          await newPage.waitForLoadState('domcontentloaded');
          await newPage.waitForTimeout(1500); // Show the loaded page briefly
          
          // Close the new tab and return to the main page
          await newPage.close();
          await page.bringToFront();
          await page.waitForTimeout(1000); // Settle back on the homepage
        }
      }
    }
  });

  // ------------------------------------------------------------------
  // Parameterized tests: Create a separate test case for each main menu
  // ------------------------------------------------------------------
  const mainMenus = ['Products', 'Services', 'About Us', 'Contact'];
  
  for (const label of mainMenus) {
    test(`Click main menu item: ${label}`, async ({ page }) => {
      const targetSitePage = new TargetSitePage(page);
      await targetSitePage.navigate();

      const item = page.locator(`text="${label}"`).first();
      
      // We expect the menu item to be visible
      await expect(item).toBeVisible();

      // --- VISUAL SHOWCASE EFFECT: Highlight ---
      await item.evaluate(node => {
        // @ts-ignore
        node.style.border = '4px solid green';
        // @ts-ignore
        node.style.backgroundColor = 'lightblue';
      });
      await page.waitForTimeout(1500); 
      
      // Click the main menu item
      await item.click();
      
      // Wait for page to settle or navigate
      await page.waitForTimeout(2000);
      
      // Note: Since each is its own test case, Playwright will automatically
      // launch a fresh page context and navigate for the next test!
    });
  }
});
