import { test, expect } from '@playwright/test';
import { Container } from '../../automation/core/container';
import { SvitlaTestBlocks } from './utils/testBlocks';
import { siteConfig } from './svitla.config';

test.describe('Svitla.com Navigation Dropdown Visual Tests @live', () => {
  let container: Container;
  let testBlocks: SvitlaTestBlocks;

  test.beforeEach(async () => {
    container = Container.getInstance();
    testBlocks = new SvitlaTestBlocks(container);
  });

  test('NAV-VIS-001: Open Solutions Dropdown and visually check menu items', async ({ page }) => {
    const { page: svitlaPage } = await testBlocks.initializeTest(page, 'NAV-VIS-001');
    // Attempt to open Solutions dropdown
    await testBlocks.verifySolutionsDropdown(svitlaPage);
    // Screenshot after opening dropdown
    await svitlaPage.screenshot({ path: 'tests/svitla/artifacts/nav-solutions-dropdown.png' });
  // Check for visible menu items (use visible nav list items under any opened submenu)
  const menuItems = svitlaPage.locator('nav ul li:visible');
    const count = await menuItems.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const item = menuItems.nth(i);
      await expect(item).toBeVisible();
      // Optionally click each item and screenshot
      await item.hover();
      await svitlaPage.screenshot({ path: `tests/svitla/artifacts/nav-solutions-item-${i}.png` });
    }
  });

  test('NAV-VIS-002: Interact with first Solutions dropdown item', async ({ page }) => {
    const { page: svitlaPage } = await testBlocks.initializeTest(page, 'NAV-VIS-002');
    await testBlocks.verifySolutionsDropdown(svitlaPage);
    // Interact with first menu item
  const menuItems = svitlaPage.locator('nav ul li:visible');
  if ((await menuItems.count()) > 0) {
      const firstItem = menuItems.first();
      await expect(firstItem).toBeVisible();
      await firstItem.click();
      await svitlaPage.waitForLoadState('networkidle');
      await svitlaPage.screenshot({ path: 'tests/svitla/artifacts/nav-solutions-first-item-click.png' });
    }
  });
});

test.describe('Svitla.com Navigation Tests @live', () => {
  let container: Container;
  let testBlocks: SvitlaTestBlocks;

  test.beforeEach(async () => {
    container = Container.getInstance();
    testBlocks = new SvitlaTestBlocks(container);
  });

  test('NAV-001: Main Navigation Functionality', async ({ page }) => {
    const { page: svitlaPage } = await testBlocks.initializeTest(page, 'NAV-001');
    await testBlocks.verifyNavigation(svitlaPage);
    await svitlaPage.screenshot({ path: 'tests/svitla/artifacts/nav-main.png' });
  });

  test('NAV-002: Solutions Dropdown Menu', async ({ page }) => {
    const { page: svitlaPage } = await testBlocks.initializeTest(page, 'NAV-002');
    await testBlocks.verifySolutionsDropdown(svitlaPage);
    await svitlaPage.screenshot({ path: 'tests/svitla/artifacts/nav-solutions-dropdown.png' });
  });
});
