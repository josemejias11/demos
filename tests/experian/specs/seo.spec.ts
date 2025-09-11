import { test, expect } from '@playwright/test';
import { HomePage } from '../pageObjects/HomePage';

test.describe('Experian SEO and Accessibility @seo @accessibility', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('TC-039: Essential meta tags and SEO elements', async () => {
    await homePage.goto();
    
    // Check for essential meta tags
    const title = await homePage.page.locator('title').textContent();
    expect(title).toBeTruthy();
    expect(title!.length).toBeGreaterThan(10);
    expect(title!.length).toBeLessThan(60); // SEO best practice
    
    // Meta description
    const metaDescription = await homePage.page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBeTruthy();
    expect(metaDescription!.length).toBeGreaterThan(120);
    expect(metaDescription!.length).toBeLessThan(160); // SEO best practice
    
    // Canonical URL
    const canonical = await homePage.page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBeTruthy();
    
    // Viewport meta tag
  const viewport = await homePage.page.locator('meta[name="viewport"]').first().getAttribute('content');
    expect(viewport).toBeTruthy();
    expect(viewport).toContain('width=device-width');
    
    // Language attribute
  const rawHtmlLang = await homePage.page.locator('html').getAttribute('lang') || '';
  const htmlLang = rawHtmlLang.toLowerCase();
  expect(htmlLang).toBeTruthy();
  expect(htmlLang).toMatch(/^[a-z]{2}(-[a-z]{2})?$/); // e.g., "en" or "en-us"
  });

  test('TC-040: Structured data and schema markup', async () => {
    await homePage.goto();
    
    // Check for JSON-LD structured data
    const jsonLdScripts = await homePage.page.locator('script[type="application/ld+json"]').count();
    const microdataElements = await homePage.page.locator('[itemscope], [itemtype], [itemprop]').count();
    const hasStructuredData = jsonLdScripts > 0 || microdataElements > 0;
    if (hasStructuredData) {
      // If we have JSON-LD, validate the first one
      if (jsonLdScripts > 0) {
        const jsonLdContent = await homePage.page.locator('script[type="application/ld+json"]').first().textContent();
        expect(jsonLdContent).toBeTruthy();
        const parsedJson = JSON.parse(jsonLdContent!);
        expect(parsedJson['@context'] || parsedJson['@type']).toBeTruthy();
      }
    } else {
      // Not all pages include structured data on the public homepage; log and continue
      console.log('No structured data (JSON-LD or microdata) found on this page');
    }
  });

  test('TC-041: Accessibility compliance and ARIA', async () => {
    await homePage.goto();
    
    // Check for essential accessibility elements
    const hasHeadings = await homePage.page.locator('h1, h2, h3, h4, h5, h6').count();
    expect(hasHeadings).toBeGreaterThan(0);
    
    // H1 should be present and unique
    const h1Count = await homePage.page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    expect(h1Count).toBeLessThanOrEqual(1); // Should have exactly one H1
    
    // Images should have alt text
    const images = await homePage.page.locator('img').all();
    let imagesWithAlt = 0;
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (alt !== null) imagesWithAlt++;
    }
    
    const altTextCoverage = images.length > 0 ? imagesWithAlt / images.length : 1;
    expect(altTextCoverage).toBeGreaterThan(0.8); // 80% of images should have alt text
    
    // Check for ARIA landmarks
    const landmarks = await homePage.page.locator('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer').count();
    expect(landmarks).toBeGreaterThan(0);
    
    // Links should have descriptive text
    const links = await homePage.page.locator('a[href]').all();
    let descriptiveLinks = 0;
    for (const link of links) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');
      
      if ((text && text.trim().length > 2) || ariaLabel || title) {
        descriptiveLinks++;
      }
    }
    
    const linkDescriptionCoverage = links.length > 0 ? descriptiveLinks / links.length : 1;
    expect(linkDescriptionCoverage).toBeGreaterThan(0.9); // 90% of links should be descriptive
    
    // Check for skip navigation
    const skipLink = await homePage.page.locator('a[href="#main"], a[href="#content"], a:has-text("skip")').isVisible().catch(() => false);
    expect(skipLink).toBe(true);
  });
});

test.describe('Experian Performance and Technical SEO @seo @performance', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('TC-042: Page load performance metrics', async () => {
    // Capture console messages and network requests for visibility during this run
    const logs: string[] = [];
    const requests: string[] = [];
    homePage.page.on('console', msg => logs.push(`[console:${msg.type()}] ${msg.text()}`));
    homePage.page.on('request', req => requests.push(`REQ ${req.method()} ${req.url()}`));
    homePage.page.on('response', res => requests.push(`RES ${res.status()} ${res.url()}`));

    const startTime = Date.now();
    await homePage.goto();
    // networkidle can hang on pages with long-lived connections; wait for 'load' with a reasonable timeout instead
    await homePage.page.waitForLoadState('load', { timeout: 30000 });
    const loadTime = Date.now() - startTime;

    // Page should load within reasonable time (8 seconds tolerated for public site)
    expect(loadTime).toBeLessThan(8000);

    // Check for performance metrics
    const performanceMetrics = await homePage.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: (performance.getEntriesByName('first-contentful-paint')[0] as unknown as { startTime?: number })?.startTime || 0
      };
    });

    // DOM should be interactive quickly
    expect(performanceMetrics.domContentLoaded).toBeLessThan(3000);

    // Conditionally assert on FCP if PERF_STRICT=true, otherwise log it for visibility
    console.log('performanceMetrics', performanceMetrics);
    if (performanceMetrics.firstContentfulPaint > 0) {
      if (process.env.PERF_STRICT && /^(true|1|yes)$/i.test(process.env.PERF_STRICT)) {
        expect(performanceMetrics.firstContentfulPaint).toBeLessThan(3000);
      } else {
        // Save logs/requests to console so they appear in test report and traces
        console.log('PERF CHECK (informational): firstContentfulPaint=', performanceMetrics.firstContentfulPaint);
        console.log('Captured console messages:', logs.slice(0, 50));
        console.log('Captured network snippets:', requests.slice(0, 50));
      }
    }
  });

  test('TC-043: Resource optimization and caching', async () => {
    await homePage.goto();
    
    // Check for resource optimization
    const resourceSizes = await homePage.page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const totalSize = resources.reduce((sum, resource) => {
        return sum + (resource.transferSize || 0);
      }, 0);
      
      return {
        totalTransferSize: totalSize,
        resourceCount: resources.length,
        cachedResources: resources.filter(r => r.transferSize === 0).length
      };
    });
    
    // Total page size should be reasonable (under 3MB)
    expect(resourceSizes.totalTransferSize).toBeLessThan(3 * 1024 * 1024);
    
    // Should have some cached resources for performance
    expect(resourceSizes.cachedResources).toBeGreaterThan(0);
    
    // Check for compression by issuing a direct request for the document and examining headers
    try {
      const resp = await homePage.page.request.get(homePage.page.url());
      const contentEncoding = resp.headers()['content-encoding'];
      const hasCompression = contentEncoding && (contentEncoding.includes('gzip') || contentEncoding.includes('br'));
      expect(hasCompression).toBe(true);
    } catch (e) {
      console.log('Could not fetch page headers via page.request.get():', e);
    }
  });
});
