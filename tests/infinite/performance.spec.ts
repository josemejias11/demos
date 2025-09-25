import { test, expect } from '@playwright/test';
import { Container } from '../../automation/core/container';
import { InfiniteTestBlocks } from './utils/testBlocks';
import { PerformanceTestUtils } from './utils/performanceUtils';
import { siteConfig, performanceThresholds } from './infinite.config';

test.describe('Infinite.com Performance Tests @live', () => {
  let container: Container;
  let testBlocks: InfiniteTestBlocks;
  let performanceUtils: PerformanceTestUtils;

  test.beforeEach(async () => {
    container = Container.getInstance();
    testBlocks = new InfiniteTestBlocks(container);
    performanceUtils = new PerformanceTestUtils(container);
  });

  test('PERF-001: Page Load Metrics', async ({ page }) => {
    const infinitePage = await testBlocks.initializeTest(page, 'PERF-001');
    
    // Use testBlocks cookie handling
    await testBlocks.handleCookieConsent(infinitePage);
    
    // Measure page load with Core Web Vitals
    const pageLoadTime = await performanceUtils.measurePageLoad(siteConfig.baseURL, page);
    expect(pageLoadTime).toBeLessThan(performanceThresholds.maxPageLoadTime);
    
    await infinitePage.recordTelemetry('test.perf_001_completed', {
      testResult: 'passed',
      pageLoadTime
    });
  });

  test('PERF-002: Carousel Performance', async ({ page }) => {
    const infinitePage = await testBlocks.initializeTest(page, 'PERF-002');
    
    await testBlocks.handleCookieConsent(infinitePage);
    
    // Test carousel performance using testBlocks
    await testBlocks.testHeroCarousel(infinitePage.page);
    
    await infinitePage.recordTelemetry('test.perf_002_completed', {
      testResult: 'passed'
    });
  });

  test('PERF-003: Image Loading Optimization', async ({ page }) => {
    const infinitePage = await testBlocks.initializeTest(page, 'PERF-003');
    
    await testBlocks.handleCookieConsent(infinitePage);
    
    // Check for image loading (skip cookie dialog placeholder images and data URIs)
    const imgSelector = 'img:not([id*="Cybot"]):not([src^="data:"])';
    const images = page.locator(imgSelector);
    const imageCount = await images.count();
    if (imageCount > 0) {
      // Progressive scroll + naturalWidth check for lazy-loaded images
      const maxAttempts = 10;
      let loaded = false;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        loaded = await page.evaluate((selector) => {
          const imgs = Array.from(document.querySelectorAll(selector)) as HTMLImageElement[];
          return imgs.some((img) => img.complete && img.naturalWidth > 0);
        }, imgSelector);
        if (loaded) break;
        // Scroll to trigger lazy loading
        await page.evaluate(() => window.scrollBy(0, Math.floor(window.innerHeight * 0.9)));
        await page.waitForTimeout(500);
      }
      expect(loaded, 'At least one meaningful image should have loaded (naturalWidth > 0)').toBeTruthy();
    }
    
    await infinitePage.recordTelemetry('test.perf_003_completed', {
      testResult: 'passed',
      imageCount
    });
  });

  test('PERF-004: Core Web Vitals', async ({ page }) => {
    const infinitePage = await testBlocks.initializeTest(page, 'PERF-004');
    
    await testBlocks.handleCookieConsent(infinitePage);
    
    // Measure page load with Core Web Vitals
    const pageLoadTime = await performanceUtils.measurePageLoad(siteConfig.baseURL, page);
    expect(pageLoadTime).toBeLessThan(performanceThresholds.maxPageLoadTime);

    // Get detailed Core Web Vitals
    const coreVitals = await performanceUtils.performCoreWebVitalsCheck(page);
    
    await infinitePage.recordTelemetry('test.perf_004_completed', {
      testResult: 'passed',
      pageLoadTime,
      coreVitals
    });
  });
});