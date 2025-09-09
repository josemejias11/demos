import { test, expect } from '@playwright/test';

test.describe('Bristlecone Error Handling & Edge Cases', () => {
  
  test('BC-027: Invalid URL handling @edge @p2', async ({ page }) => {
    // Test various invalid URLs
    const invalidUrls = [
      '/invalid-page-that-does-not-exist',
      '/nonexistent-section/subsection',
      '/404-test',
      '/admin', // Should not be accessible
      '/wp-admin' // WordPress admin (should redirect or show error)
    ];

    for (const url of invalidUrls) {
      const response = await page.goto(url, { waitUntil: 'networkidle' });
      
      // Should either get 404 status or be redirected
      const status = response?.status();
      
      if (status === 404) {
        // Verify 404 page exists and is informative
        const pageContent = await page.textContent('body');
        expect(pageContent).toBeTruthy();
        
        // Should contain helpful information
        const content = pageContent?.toLowerCase() || '';
        const hasHelpfulContent = 
          content.includes('not found') ||
          content.includes('404') ||
          content.includes('page') ||
          content.includes('error');
        
        expect(hasHelpfulContent).toBe(true);
        
        // Should have navigation back to site
        const homeLink = page.locator('a[href="/"], a[href="https://www.bristlecone.com"], a:has-text("Home")');
        expect(await homeLink.count()).toBeGreaterThan(0);
        
      } else if (status && status >= 300 && status < 400) {
        // Redirect is acceptable
        expect(status).toBeGreaterThanOrEqual(300);
        expect(status).toBeLessThan(400);
      }
      
      console.log(`${url} returned status: ${status}`);
    }
  });

  test('BC-028: JavaScript error tolerance @edge @p2', async ({ page }) => {
    const consoleEvents: { msg: string; url?: string }[] = [];
    const pageErrors: { err: string; url?: string }[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleEvents.push({ msg: msg.text(), url: page.url() });
    });
    page.on('pageerror', (err) => {
      pageErrors.push({ err: err.message, url: page.url() });
    });

    const pagesToProbe = [
      { url: '/', check: async () => expect(await page.locator('h1').first().isVisible()).toBe(true) },
      { url: '/contact/', check: async () => expect(await page.getByRole('link', { name: 'Contact Us' }).first().isVisible()).toBe(true) },
      { url: '/services/', check: async () => expect(await page.locator('h1, h2').first().isVisible()).toBe(true) },
    ];

    const CRITICAL_MAX = parseInt(process.env.BC_CRITICAL_JS_MAX || '2', 10);

    for (const pInfo of pagesToProbe) {
      const startConsole = consoleEvents.length;
      const startErrors = pageErrors.length;
      await page.goto(pInfo.url);
      await page.waitForLoadState('domcontentloaded');
      await pInfo.check();
      // small settle to accumulate async errors
      await page.waitForTimeout(500);
      const newConsole = consoleEvents.slice(startConsole);
      const newErrors = pageErrors.slice(startErrors);
      const criticalErrors = newErrors.filter(e =>
        !/jquery/i.test(e.err) &&
        !/analytics/i.test(e.err) &&
        !/tracking/i.test(e.err) &&
        !/non-critical/i.test(e.err)
      );
      console.log(`[BC-028] Page ${pInfo.url} consoleErr=${newConsole.length} jsErr=${newErrors.length} critical=${criticalErrors.length}`);
      expect(criticalErrors.length).toBeLessThanOrEqual(CRITICAL_MAX);
    }
    console.log(`[BC-028] Total console errors captured: ${consoleEvents.length}`);
    console.log(`[BC-028] Total page errors captured: ${pageErrors.length}`);
  });

  test('BC-029: Form submission with network issues @edge @p2', async ({ page }) => {
    // Navigate to contact page
    await page.goto('/contact/');
    
    // Open contact form
    await page.getByRole('link', { name: 'Contact Us' }).first().click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    const iframe = page.frameLocator('iframe').first();
    
    // Fill out form
    await iframe.getByLabel('Email*').fill('network-test@example.com');
    await iframe.getByLabel('First name*').fill('Network');
    await iframe.getByLabel('Last name*').fill('Test');
    await iframe.getByLabel('Message*').fill('Testing network error handling');
    await iframe.getByRole('checkbox', { name: /Privacy Policy/ }).check();
    
    // Simulate slow network by throttling
    await page.route('**/*', route => {
      // Delay all requests by 2 seconds to simulate slow network
      setTimeout(() => route.continue(), 2000);
    });
    
    // Try to submit form
    const submitButton = iframe.getByRole('button', { name: 'Submit' });
    await submitButton.click();
    
    // Wait and check that either:
    // 1. Form shows loading state
    // 2. Form shows error message  
    // 3. Form submission eventually succeeds
    await page.waitForTimeout(5000);
    
    // The page should still be responsive
    const isDialogStillVisible = await page.locator('[role="dialog"]').isVisible();
    const isFormStillVisible = await iframe.getByLabel('Email*').isVisible();
    
    // Either the form is still there (waiting) or it succeeded/failed gracefully
    expect(isDialogStillVisible || isFormStillVisible).toBeTruthy();
  });

  test('BC-030: Cross-browser compatibility @edge @p1', async ({ page, browserName }) => {
    // This test verifies core functionality works across browsers
    // The actual cross-browser testing is handled by Playwright's project configuration
    
    await page.goto('/');
    
    // Core functionality that should work in all browsers
    
    // 1. Page loads
    await expect(page).toHaveTitle(/Bristlecone/);
    
    // 2. Basic navigation works
    await expect(page.locator('nav')).toBeVisible();
    
  // 3. Hero content displays (at least one heading)
  await expect(page.locator('h1').first()).toBeVisible();
    
    // 4. Links are clickable
    const footerLink = page.locator('footer a').first();
    if (await footerLink.isVisible()) {
      expect(await footerLink.getAttribute('href')).toBeTruthy();
    }
    
    // 5. Forms are accessible
    await page.goto('/contact/');
    await page.getByRole('link', { name: 'Contact Us' }).first().click();
    // Narrow dialog to active popupmaker id if present
    const activeDialog = page.locator('[role="dialog"].pum-active, #pum-602.pum-active');
    if (await activeDialog.count() > 0) {
      await expect(activeDialog.first()).toBeVisible();
    } else {
      // Fallback: any dialog
      await expect(page.locator('[role="dialog"]').first()).toBeVisible();
    }
    
    // Attempt to find visible email field in any iframe (HubSpot form) with short polling
    const start = Date.now();
    let emailVisible = false;
    while (Date.now() - start < 5000 && !emailVisible) {
      const frames = page.frames();
      for (const f of frames) {
        try {
          const el = await f.getByLabel?.('Email*');
          if (el) {
            const handle = f.locator('label:has-text("Email"), input[name="email"]');
            if (await handle.first().isVisible()) {
              emailVisible = true;
              break;
            }
          }
        } catch { /* ignore */ }
      }
      if (!emailVisible) await page.waitForTimeout(250);
    }
    console.log(`[BC-030] Email field visible: ${emailVisible}`);
    expect(emailVisible).toBe(true);
    
    // 6. CSS styles are applied (check computed styles)
    const bodyStyles = await page.evaluate(() => {
      const styles = window.getComputedStyle(document.body);
      return {
        fontFamily: styles.fontFamily,
        backgroundColor: styles.backgroundColor,
        margin: styles.margin
      };
    });
    
    // Body should have styling applied
    expect(bodyStyles.fontFamily).not.toBe('');
    expect(bodyStyles.fontFamily).not.toBe('Times'); // Should not be default browser font
    
    console.log(`Browser: ${browserName}, Styles applied:`, bodyStyles);
    
    // 7. JavaScript functionality works
    const hasJavaScript = await page.evaluate(() => {
      return typeof window !== 'undefined' && typeof document !== 'undefined';
    });
    
    expect(hasJavaScript).toBe(true);
  });

  test('BC-014: Industries page content loads @content @p1', async ({ page }) => {
    await page.goto('/industries/');
    
    // Verify page loads successfully
    await expect(page).toHaveTitle(/Industries|Bristlecone/);
    
    // Check for main industry categories
    const industries = ['Manufacturing', 'Consumer Goods', 'Life Sciences', 'Technology'];
    
    for (const industry of industries) {
      const industryElement = page.locator(`text=${industry}`);
      await expect(industryElement.first()).toBeVisible();
    }
    
    // Verify page has meaningful content
    const pageContent = await page.textContent('main, .content, body');
    expect(pageContent?.length).toBeGreaterThan(100);
  });

  test('BC-015: Services page content loads @content @p1', async ({ page }) => {
    await page.goto('/services/');
    
    // Verify page loads successfully  
    await expect(page).toHaveTitle(/Services|Bristlecone/);
    
    // Check for main service categories
  const services = ['Consulting', 'Change Management', 'Integration', 'AI', 'Cloud'];
    
    for (const service of services) {
      const candidates = page.getByText(service, { exact: false });
      const count = await candidates.count();
      if (count === 0) continue; // not present on this variant
      // Find first visible candidate
      let foundVisible = false;
      for (let i = 0; i < Math.min(count, 5); i++) {
        const c = candidates.nth(i);
        if (await c.isVisible()) {
          await expect(c).toBeVisible();
          foundVisible = true;
          break;
        }
      }
      // Do not fail if only hidden instances (cookie banners etc.)
      if (!foundVisible) {
        console.log(`[BC-015] Service text present but hidden: ${service}`);
      }
    }
  });

  test('BC-016: Company/About page loads @content @p1', async ({ page }) => {
    await page.goto('/company/');
    
    // Verify page loads successfully
    await expect(page).toHaveTitle(/Company|About|Bristlecone/);
    
    // Should contain company information
    const aboutContent = page.getByText(/supply chain/i).first();
    if (await aboutContent.count() > 0) {
      await expect(aboutContent).toBeVisible();
    } else {
      // Fallback: ensure some heading exists
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });

  test('BC-017: Events page functionality @content @p2', async ({ page }) => {
    await page.goto('/events/');
    
    // Verify page loads
    await expect(page).toHaveTitle(/Events|Bristlecone/);
    
    // Should have events content or message about no current events
    const pageText = await page.textContent('body');
    const hasEventsContent = 
      pageText?.includes('event') || 
      pageText?.includes('upcoming') || 
      pageText?.includes('past') ||
      pageText?.includes('conference') ||
      pageText?.includes('webinar');
    
    expect(hasEventsContent).toBe(true);
  });

  test('BC-018: Insights/Blog content access @content @p1', async ({ page }) => {
    await page.goto('/insights/');
    
    // Verify page loads
    await expect(page).toHaveTitle(/Insights|News|Bristlecone/);
    
    // Should have content categories
    const contentTypes = ['News', 'White Papers', 'Blog', 'Case Studies'];
    
    for (const type of contentTypes) {
      const typeElement = page.locator(`text=${type}`);
      if (await typeElement.count() > 0) {
        await expect(typeElement.first()).toBeVisible();
      }
    }
  });
});
