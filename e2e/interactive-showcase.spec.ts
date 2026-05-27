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

    // Find items that likely trigger dropdown menus (often buttons or links with aria-expanded or within a nav)
    // We will look for elements that have a text label and are part of the main navigation.
    const navItems = page.locator('header [role="menuitem"], header nav > ul > li > a, header nav button');
    
    const count = await navItems.count();
    
    // For a showcase, we might just want to interact with the first 3 to keep the test duration reasonable
    const limit = Math.min(count, 3);

    for (let i = 0; i < limit; i++) {
      const item = navItems.nth(i);
      
      // Ensure the item is visible and interactable
      if (await item.isVisible()) {
        // --- VISUAL SHOWCASE EFFECT: Hover to open ---
        await item.hover();
        
        // Add a deliberate wait so the viewer can see the menu open
        await page.waitForTimeout(1500); 

        // Now find a link inside the newly opened menu.
        // We look for links that are visible and NOT the menu trigger itself.
        const linksInMenu = page.locator('header a:visible');
        
        const linkCount = await linksInMenu.count();
        if (linkCount > 0) {
          // Let's pick a link that is different from the trigger item
          // Just picking the last visible link or the second one is usually safe for a dropdown
          const linkToClick = linksInMenu.nth(Math.min(1, linkCount - 1));
          
          // --- VISUAL SHOWCASE EFFECT: Highlight ---
          // Draw a border around it to show intent
          await linkToClick.evaluate(node => node.style.border = '3px solid red');
          await page.waitForTimeout(1000); // Wait so the highlight is seen
          
          // Click the link
          await linkToClick.click();
          
          // Wait for the new page to load
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(1000); // Show the loaded page briefly
          
          // Go back to the homepage for the next iteration
          await moodysComPage.navigate();
          await page.waitForTimeout(1000); // Settle back on the homepage
        }
      }
    }
  });
});
