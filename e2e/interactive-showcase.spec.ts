import { test, expect } from '@playwright/test';
import { MoodysComPage } from '../pageObjects/MoodysComPage';
import { setupPageGuards } from '../setup/global.setup';

test.describe('moodys.com Interactive Showcase', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await setupPageGuards(page, testInfo.title);
  });

  test('Visually navigate menus and click links', async ({ page }) => {
    // 1. Navigate to the homepage
    const moodysComPage = new MoodysComPage(page);
    await moodysComPage.navigate();

    // 2. We want to find the top-level navigation items. 
    // On many modern sites, the main navigation items have role="menuitem" or are links inside the header nav.
    // Let's use Playwright's robust locators to find them.
    
    // Attempt to locate the main header and its primary navigation buttons/links
    // This uses a resilient locator strategy to find top-level menu triggers.
    const header = page.locator('header').first();
    await expect(header).toBeVisible();

    // Use specific text matching for known Moodys.com top-level menu items.
    // Moodys uses distinct text labels for its main dropdowns.
    const menuLabels = ['Solutions', 'Insights', 'About Moody\'s'];
    
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
        if (linkCount > 10) {
          // Dropdowns usually have many links. We pick one further down the list 
          // (e.g. index 10) to ensure it's inside the expanded mega-menu and not a standard header link.
          const linkToClick = linksInMenu.nth(10);
          
          // --- VISUAL SHOWCASE EFFECT: Highlight ---
          // Draw a thick red border around it to show intent
          await linkToClick.evaluate(node => {
            // @ts-ignore
            node.style.border = '4px solid red';
            // @ts-ignore
            node.style.backgroundColor = 'yellow';
          });
          await page.waitForTimeout(1500); // Wait so the highlight is clearly seen
          
          // Click the link to open in a new tab (Middle click)
          const [newPage] = await Promise.all([
            page.context().waitForEvent('page'),
            linkToClick.click({ button: 'middle' })
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

  test('Click through all top-level main menu items', async ({ page }) => {
    // 1. Navigate to the homepage
    const moodysComPage = new MoodysComPage(page);
    await moodysComPage.navigate();

    // 2. Iterate over all main top-level menu texts
    const mainMenus = ['Solutions', 'Insights', 'About Moody\'s', 'Who We Serve'];
    
    for (const label of mainMenus) {
      const item = page.locator(`text="${label}"`).first();
      
      if (await item.isVisible()) {
        // --- VISUAL SHOWCASE EFFECT: Highlight ---
        // Highlight the main menu item
        await item.evaluate(node => {
          // @ts-ignore
          node.style.border = '4px solid green';
          // @ts-ignore
          node.style.backgroundColor = 'lightblue';
        });
        await page.waitForTimeout(1500); // Wait so highlight is seen
        
        // Click the main menu item directly
        // Some menus are links, some are dropdown triggers. We click to interact.
        await item.click();
        
        // Wait for page to settle or navigate
        await page.waitForTimeout(2000);
        
        // Navigate back to the homepage to reset state for the next top-level item
        await moodysComPage.navigate();
        await page.waitForTimeout(1000);
      }
    }
  });
});
