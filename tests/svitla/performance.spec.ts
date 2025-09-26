import { test, expect } from '@playwright/test';
import { Container } from './utils/container';
import { SvitlaTestBlocks } from './utils/testBlocks';
import { siteConfig, performanceThresholds } from './svitla.config';

test.describe('Svitla.com Performance Tests @live', () => {
  let container: Container;
  let testBlocks: SvitlaTestBlocks;

  test.beforeEach(async () => {
    container = Container.getInstance();
    testBlocks = new SvitlaTestBlocks(container);
  });

  test('PERF-001: Page Load Metrics', async ({ page }) => {
    const { page: svitlaPage } = await testBlocks.initializeTest(page, 'PERF-001');
    const start = Date.now();
    await svitlaPage.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(performanceThresholds.maxPageLoadTime);
  });

  test('PERF-002: Hero Carousel Performance', async ({ page }) => {
    const { page: svitlaPage } = await testBlocks.initializeTest(page, 'PERF-002');
    await testBlocks.testHeroCarousel(svitlaPage);
    // Add transition timing logic as needed
  });
});
