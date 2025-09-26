import { test } from '@playwright/test';
import { Container } from './utils/container';
import { SvitlaTestBlocks } from './utils/testBlocks';
import { siteConfig } from './svitla.config';

test.describe('Svitla.com Visual Smoke Test @live', () => {
  let container: Container;
  let testBlocks: SvitlaTestBlocks;

  test.beforeEach(async () => {
    container = Container.getInstance();
    testBlocks = new SvitlaTestBlocks(container);
  });

  test('VISUAL-001: Full User Journey', async ({ page }) => {
    const { page: svitlaPage } = await testBlocks.initializeTest(page, 'VISUAL-001');
    await testBlocks.verifyNavigation(svitlaPage);
    await testBlocks.verifySolutionsDropdown(svitlaPage);
    // Stabilize: ensure we are on the homepage before continuing the smoke journey
    try {
      if (!svitlaPage.url().startsWith(siteConfig.baseURL)) {
        await svitlaPage.goto(siteConfig.baseURL + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await svitlaPage.waitForSelector(siteConfig.selectors.mainContent, { timeout: 10000 }).catch(() => {});
      }
    } catch {
      // If navigation fails, continue to allow downstream errors to capture artifacts
    }
    // Use an isolated page for the hero/tabs/footer validations to avoid one navigation closing the test page
    let heroPage = await page.context().newPage();
    try {
      // Use initializeTest to navigate and dismiss cookies on the new page
      await testBlocks.initializeTest(heroPage, 'VISUAL-001-hero');
      // Retry once if the page closes mid-validation
      let attempts = 0;
      while (attempts < 2) {
        try {
          await testBlocks.testHeroCarousel(heroPage);
          await testBlocks.testIndustryTabs(heroPage);
          await testBlocks.verifyFooter(heroPage);
          await heroPage.screenshot({ path: 'tests/svitla/artifacts/smoke-full-journey.png' });
          break;
        } catch (err) {
          const msg = (err as Error).message || '';
          if (msg.includes('Page closed') && attempts === 0) {
            // close and replace page then retry once
            await heroPage.close().catch(() => {});
            heroPage = await page.context().newPage();
            await testBlocks.initializeTest(heroPage, 'VISUAL-001-hero-retry');
            attempts++;
            continue;
          }
          throw err;
        }
      }
    } finally {
      await heroPage.close().catch(() => {});
    }
  });
});
