import { test } from '@playwright/test';
import { Container } from './utils/container';
import { SvitlaTestBlocks } from './utils/testBlocks';

test.describe('Svitla.com Industry Tabs Tests @live', () => {
  let container: Container;
  let testBlocks: SvitlaTestBlocks;

  test.beforeEach(async () => {
    container = Container.getInstance();
    testBlocks = new SvitlaTestBlocks(container);
  });

  test('IND-001: Industry Tabs Visibility and Interaction', async ({ page }) => {
    const { page: svitlaPage } = await testBlocks.initializeTest(page, 'IND-001');
    await testBlocks.testIndustryTabs(svitlaPage);
    await svitlaPage.screenshot({ path: 'tests/svitla/artifacts/industry-tabs.png' });
  });
});
