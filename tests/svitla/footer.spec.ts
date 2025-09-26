import { test } from '@playwright/test';
import { Container } from './utils/container';
import { SvitlaTestBlocks } from './utils/testBlocks';

test.describe('Svitla.com Footer Tests @live', () => {
  let container: Container;
  let testBlocks: SvitlaTestBlocks;

  test.beforeEach(async () => {
    container = Container.getInstance();
    testBlocks = new SvitlaTestBlocks(container);
  });

  test('FOOTER-001: Footer Visibility and Content', async ({ page }) => {
    const { page: svitlaPage } = await testBlocks.initializeTest(page, 'FOOTER-001');
    await testBlocks.verifyFooter(svitlaPage);
    await svitlaPage.screenshot({ path: 'tests/svitla/artifacts/footer.png' });
  });
});
