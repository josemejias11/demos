import { test } from '@playwright/test';
import { Container } from './utils/container';
import { SvitlaTestBlocks } from './utils/testBlocks';

test.describe('Svitla.com Hero Carousel Tests @live', () => {
  let container: Container;
  let testBlocks: SvitlaTestBlocks;

  test.beforeEach(async () => {
    container = Container.getInstance();
    testBlocks = new SvitlaTestBlocks(container);
  });

  test('HERO-001: Hero Carousel Visibility and Navigation', async ({ page }) => {
    const { page: svitlaPage } = await testBlocks.initializeTest(page, 'HERO-001');
    await testBlocks.testHeroCarousel(svitlaPage);
    await svitlaPage.screenshot({ path: 'tests/svitla/artifacts/hero-carousel.png' });
  });
});
