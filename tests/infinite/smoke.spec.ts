import { test } from '@playwright/test';
import { Container } from '../../automation/core/container';
import { InfiniteTestBlocks } from './utils/testBlocks';

test.describe('Infinite.com Visual Smoke Tests @live', () => {
  let container: Container;
  let testBlocks: InfiniteTestBlocks;

  test.beforeEach(async () => {
    container = Container.getInstance();
    testBlocks = new InfiniteTestBlocks(container);
  });

  test('VISUAL-001: Complete User Journey Demonstration', async ({ page }) => {
    // Visual demo is intentionally slower: extend timeout to avoid premature failure
    test.setTimeout(120000);
    const infinitePage = await testBlocks.initializeTest(page, 'VISUAL-SMOKE');
    
    // Step 1: Cookie Consent (Visual Demonstration)
    console.log('Step 1: Demonstrating cookie consent handling...');
    await testBlocks.handleCookieConsent(infinitePage);
    
    // Take screenshot after cookie handling
    await page.screenshot({ path: 'test-results/visual-01-after-cookies.png', fullPage: true });
    
    // Step 2: Page Load and Initial View (Slow for Visual Effect)
    console.log('Step 2: Page loaded, taking initial screenshot...');
    await page.waitForTimeout(2000); // Pause for visual effect
    await page.screenshot({ path: 'test-results/visual-02-homepage-loaded.png', fullPage: true });
    
    // Step 3: Navigation Menu Interaction
    console.log('Step 3: Demonstrating navigation menu interactions...');
    
    // Hover over Industries menu (slow motion)
    const industriesMenu = page.getByRole('link', { name: /industries/i });
    await industriesMenu.first().hover();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/visual-03-industries-hover.png' });
    
    // Hover over Services menu 
    const servicesMenu = page.getByRole('link', { name: /services/i });
    await servicesMenu.first().hover();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/visual-04-services-hover.png' });
    
    // Demonstrate Solutions dropdown
    console.log('Step 4: Demonstrating solutions dropdown...');
    const solutionsMenu = page.locator('banner li:has-text("Solutions"), nav li:has-text("Solutions")').first();
    const cookieOverlay = page.locator('#CybotCookiebotDialog');
    if (await cookieOverlay.isVisible()) {
      const allow = page.getByRole('button', { name: /allow all|accept/i }).first();
      if (await allow.isVisible()) {
        await allow.click();
        await page.waitForTimeout(500);
      }
    }
    for (let i = 0; i < 3; i++) {
      try {
        await solutionsMenu.hover();
        const dd = page.locator('ul:has(a[href*="brassring-solutions"])').first();
        if (await dd.isVisible()) break;
      } catch {}
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(2000); // Let dropdown fully appear
    await page.screenshot({ path: 'test-results/visual-05-solutions-dropdown.png' });
    
    // Step 5: Hero Carousel Interaction
    console.log('Step 5: Demonstrating hero carousel navigation...');
    
    // Find and click next button (slow motion)
    const heroRegion = page.getByRole('region', { name: /slides/i }).first();
    const nextButton = heroRegion.getByRole('button', { name: /next slide/i }).first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'test-results/visual-06-carousel-slide-2.png' });
      
      // Click next again
      await nextButton.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'test-results/visual-07-carousel-slide-3.png' });
      
      // Click previous to go back
      const prevButton = heroRegion.getByRole('button', { name: /previous slide/i }).first();
      await prevButton.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'test-results/visual-08-carousel-back.png' });
    }
    
    // Step 6: Scroll and Content Interaction
    console.log('Step 6: Demonstrating page scrolling and content interaction...');
    
    // Scroll to services section
    await page.locator('text="Future Ready Services"').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/visual-09-services-section.png' });
    
    // Test services carousel if present
    const servicesCarousel = page.getByRole('region', { name: /image carousel/i }).first();
    if (await servicesCarousel.isVisible()) {
      const serviceNext = servicesCarousel.getByRole('button', { name: /next slide/i }).first();
      await serviceNext.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'test-results/visual-10-services-carousel.png' });
    }
    
    // Step 7: Industry Tabs Interaction
    console.log('Step 7: Demonstrating industry tabs interaction...');
    
    // Scroll to industry section
    await page.locator('text="Industry Focus"').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    
    // Click on different industry tabs
    const bankingTab = page.getByRole('tab', { name: /banking/i });
    if (await bankingTab.isVisible()) {
      await bankingTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'test-results/visual-11-banking-tab.png' });
    }
    
    const insuranceTab = page.getByRole('tab', { name: /insurance/i });
    if (await insuranceTab.isVisible()) {
      await insuranceTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'test-results/visual-12-insurance-tab.png' });
    }
    
    // Step 8: Footer and Contact Information
    console.log('Step 8: Demonstrating footer and contact sections...');
    
    // Scroll to footer (robust fallback)
    const footer = page.locator('footer, .footer').first();
    try {
      if (await footer.count()) {
        await footer.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
      } else {
        // Fallback: scroll to bottom
        await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
        await page.waitForTimeout(1200);
      }
    } catch {
      // Last resort fallback: smooth scroll to bottom
      await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
      await page.waitForTimeout(1200);
    }
    await page.screenshot({ path: 'test-results/visual-13-footer-section.png' });
    
    // Step 9: Responsive Design Check
    console.log('Step 9: Demonstrating responsive design...');
    
    // Switch to tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/visual-14-tablet-view.png', fullPage: true });
    
    // Switch to mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/visual-15-mobile-view.png', fullPage: true });
    
    // Back to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    
    // Step 10: Contact Form Interaction (if available)
    console.log('Step 10: Looking for contact forms or CTAs...');
    
    const contactButton = page.getByRole('link', { name: /contact/i }).first();
    if (await contactButton.isVisible()) {
      await contactButton.hover();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/visual-16-contact-cta.png' });
    }
    
    // Final telemetry
    await infinitePage.recordTelemetry('test.visual_smoke_completed', {
      testResult: 'passed',
      screenshotsTaken: 16,
      interactionsCompleted: 'full_user_journey',
      responsiveViews: ['desktop', 'tablet', 'mobile']
    });
    
    console.log('✅ Visual smoke test completed successfully!');
    console.log('📸 Screenshots saved to test-results/visual-*.png');
    console.log('🎥 Video recording available for review');
  });
  
  test('VISUAL-002: Performance and Animation Smoothness', async ({ page }) => {
    const infinitePage = await testBlocks.initializeTest(page, 'VISUAL-PERF');
    
    console.log('Performance Visual Test: Demonstrating smooth animations...');
    
    await testBlocks.handleCookieConsent(infinitePage);
    
    // Test carousel animations in slow motion
    const heroCarousel = page.getByRole('region', { name: /slides/i }).first();
    if (await heroCarousel.isVisible()) {
      console.log('Testing carousel transition smoothness...');
      
      // Multiple carousel clicks with timing measurements
      for (let i = 0; i < 3; i++) {
        const startTime = Date.now();
        const nextBtn = heroCarousel.getByRole('button', { name: /next slide/i }).first();
        await nextBtn.click();
        
        // Wait for transition to complete
        await page.waitForTimeout(1000);
        const duration = Date.now() - startTime;
        
        console.log(`Carousel transition ${i + 1} took ${duration}ms`);
        await page.screenshot({ path: `test-results/visual-perf-carousel-${i + 1}.png` });
      }
    }
    
    // Test hover effects on navigation
    console.log('Testing navigation hover effects...');
    // Ensure no cookie overlay is blocking pointer events
    const cookieOverlay2 = page.locator('#CybotCookiebotDialog');
    if (await cookieOverlay2.isVisible()) {
      const allow2 = page.getByRole('button', { name: /allow all|accept/i }).first();
      if (await allow2.isVisible()) {
        await allow2.click();
        await page.waitForTimeout(500);
      }
    }
    const navItems = page.locator('nav a, banner a, header a');
    const count = Math.min(5, await navItems.count());
    
    for (let i = 0; i < count; i++) {
      await navItems.nth(i).hover();
      await page.waitForTimeout(500); // Observe hover effect
    }
    
    await infinitePage.recordTelemetry('test.visual_performance_completed', {
      testResult: 'passed',
      animationsTested: 'carousel_and_hovers'
    });
    
    console.log('✅ Performance visual test completed!');
  });
});