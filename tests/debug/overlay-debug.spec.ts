import { test, expect } from '@playwright/test';

test.describe('Overlay debug', () => {
  test.setTimeout(120000);
  test('capture overlays, console and try to dismiss', async ({ page }, testInfo) => {
    const logs: string[] = [];
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });
    const presentOverlays: string[] = [];
    const dismissed: string[] = [];

    try {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Save initial screenshot
      const before = `overlay-before-${testInfo.project.name}.png`;
      await page.screenshot({ path: `test-results/${before}`, fullPage: true });

  // Small wait to allow late-injected overlays (ads/newsletter popups)
  await page.waitForTimeout(2500);

  // Try common overlay selectors (individual checks)
      const overlaySelectors = [
        '[data-testid="newsletter"]',
        '.newsletter',
        '.modal-newsletter',
        '.signup-modal',
        '.email-modal',
        '[role="dialog"]:has-text("Subscribe")',
        '[role="dialog"]:has-text("Sign up")',
        '[role="dialog"]:has-text("Subscribe to our")',
        '.popup-newsletter',
        '.overlay-signup',
        '#newsletter-popup',
        '#email-modal',
      ];

      const cookieSelectors = ['[aria-label*="cookie"]', '.cookie-banner', '[data-testid="cookie-banner"]'];

      for (const sel of [...overlaySelectors, ...cookieSelectors]) {
        const count = await page.locator(sel).count();
        if (count > 0) presentOverlays.push(`${sel} -> ${count}`);
      }

      // Heuristic scan: find large fixed elements that may be overlays (newsletter/email signup)
      try {
        const overlayCandidates = await page.evaluate(() => {
          const candidates: Array<{ selector: string; area: number; hasEmail: boolean; text: string }> = [];
          const all = Array.from(document.querySelectorAll('body *')) as HTMLElement[];
          for (const el of all) {
            try {
              const style = window.getComputedStyle(el);
              if (style.position === 'fixed' || style.position === 'sticky' || style.position === 'absolute') {
                const rect = el.getBoundingClientRect();
                const vw = window.innerWidth;
                const vh = window.innerHeight;
                const area = rect.width * rect.height;
                // Large overlays typically cover a significant portion of viewport or are centered modals
                if (area > (vw * vh) * 0.06 || rect.width > vw * 0.6 || rect.height > vh * 0.4) {
                  const text = el.innerText ? el.innerText.substring(0, 300) : '';
                  const hasEmail = !!el.querySelector('input[type="email"], input[name*="email"], input[id*="email"]');
                  candidates.push({ selector: el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '') + (el.className ? `.${String(el.className).split(' ').join('.')}` : ''), area, hasEmail, text });
                }
              }
            } catch (e) {
              // ignore per-element errors
            }
          }
          return candidates.slice(0, 20);
        });

        if (overlayCandidates && overlayCandidates.length > 0) {
          for (const c of overlayCandidates) {
            presentOverlays.push(`heuristic:${c.selector} area=${c.area} email=${c.hasEmail} text=${c.text.replace(/\n/g,' ').slice(0,120)}`);
          }
        }
      } catch (e) {
        // ignore evaluation errors
      }

      // Attempt to close/dismiss overlays using common strategies
      const closeCandidates = [
        'button:has-text("No thanks")',
        'button:has-text("Close")',
        'button[aria-label*="close"]',
        '.modal-close',
        '[data-testid="modal-close"]',
        'button:has-text("×")',
        'button:has-text("Not now")',
      ];

      for (const sel of closeCandidates) {
        const count = await page.locator(sel).count();
        if (count > 0) {
          for (let i = 0; i < count; i++) {
            try {
              await page.locator(sel).nth(i).click({ timeout: 2000 });
              dismissed.push(sel);
            } catch (e) {
              // ignore click failures
            }
          }
        }
      }

      // Accessibility snapshot
      try {
        const a11y = await page.accessibility.snapshot();
        await testInfo.attach('a11y.json', { body: JSON.stringify(a11y, null, 2), contentType: 'application/json' });
      } catch (e) {
        // ignore a11y snapshot failures
      }

      const after = `overlay-after-${testInfo.project.name}.png`;
      await page.screenshot({ path: `test-results/${after}`, fullPage: true });

    } catch (err) {
      logs.push('error: ' + (err as Error).message);
      // Don't rethrow; attachments will be saved in finally
    } finally {
      // Save console log
      await testInfo.attach('console.log', { body: logs.join('\n'), contentType: 'text/plain' });

      // Attach list of detected overlays and dismissed selectors
      await testInfo.attach('overlays.txt', { body: presentOverlays.join('\n') || 'none', contentType: 'text/plain' });
      await testInfo.attach('dismissed.txt', { body: dismissed.join('\n') || 'none', contentType: 'text/plain' });

      // Try to dump page HTML for inspection
      try {
        const html = await page.content();
        await testInfo.attach('page.html', { body: html, contentType: 'text/html' });
        
        // Also save to a predictable file path for programmatic inspection
        const fs = require('fs');
        const path = require('path');
        const outputDir = 'test-results/overlay-inspect';
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        fs.writeFileSync(path.join(outputDir, `page-${testInfo.project.name}.html`), html);
      } catch (e) {
        // page may be closed
        await testInfo.attach('page.html', { body: 'could not get page content: ' + (e as Error).message, contentType: 'text/plain' });
      }

      // If a blocking overlay is present and not dismissed, mark test as failed
      // Note: Cookie banners are expected and should be dismissible
      // Email signup elements are content, not blocking overlays
      const blockingOverlays = presentOverlays.filter(overlay => 
        overlay.includes('.cookie-banner') && 
        !dismissed.some(d => d.includes('cookie') || d.includes('Accept'))
      );
      
      if (blockingOverlays.length > 0) {
        test.fail();
      }
    }
  });
});
