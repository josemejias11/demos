import { Page, FrameLocator, Locator, expect } from '@playwright/test';

/**
 * Robust helper for HubSpot modal forms that often start with height=0 and multiple iframes present.
 * Strategy:
 *  1. Wait for at least one matching iframe to be attached.
 *  2. Poll inner document until form inputs appear (instead of relying on outer iframe visibility which can stay hidden briefly).
 *  3. Return a FrameLocator plus convenience getters.
 */
export async function getHubspotForm(
  page: Page,
  opts: { timeoutMs?: number; index?: number; containerSelector?: string } = {},
) {
  const timeout = opts.timeoutMs ?? 25000;
  const index = opts.index ?? 0;
  const container = opts.containerSelector; // e.g. '#pum-602'
  const start = Date.now();

  if (container) {
    // Wait for container active state
    await page.waitForSelector(`${container}.pum-active`, { timeout });
  }

  const iframeSelector = `${container ? container + ' ' : ''}iframe[id*="hs-form-iframe"]`;
  await page.waitForSelector(iframeSelector, { state: 'attached', timeout });

  // If multiple iframes, find one with an email input inside.
  // Iterate over up to first 5 iframes.
  let chosenIndex = index;
  const maxProbe = 5;
  for (let attempt = 0; attempt < maxProbe; attempt++) {
    const candidate = page.frameLocator(iframeSelector).nth(attempt);
    try {
      const emailCount = await candidate.locator('input[type="email"]').count();
      if (emailCount > 0) {
        chosenIndex = attempt;
        break;
      }
    } catch {
      /* ignore */
    }
  }

  const frame = page.frameLocator(iframeSelector).nth(chosenIndex);
  // Broader polling: some forms may not wrap controls in a <form> element initially.
  while (Date.now() - start < timeout) {
    try {
      const count = await frame.locator('form input, form textarea, form select, input, textarea, select').count();
      if (count > 0) break;
    } catch {}
    await page.waitForTimeout(250);
  }

  // Readiness: wait specifically for email field to be attached (but not necessarily visible)
  try {
    await frame.locator('input[type="email"]').first().waitFor({ state: 'attached', timeout: Math.max(1000, timeout - (Date.now() - start)) });
  } catch {
    // Leave a breadcrumb for debugging without failing immediately; caller interactions will surface error.
    console.warn('[hubspotForm] Email field not attached within expected readiness window');
  }

  return new HubspotFormHandle(frame);
}

export class HubspotFormHandle {
  constructor(private frame: FrameLocator) {}

  email(): Locator {
  return this.frame.locator('input[type="email"], input[name*="email" i], input[id*="email" i]');
  }
  firstName(): Locator {
    return this.frame.locator('input[name*="first" i], input[placeholder*="first" i], input[id*="first" i]').first();
  }
  lastName(): Locator {
    return this.frame.locator('input[name*="last" i], input[placeholder*="last" i], input[id*="last" i]').first();
  }
  company(): Locator {
    return this.frame.locator('input[name*="company" i], input[placeholder*="company" i], input[id*="company" i]').first();
  }
  phone(): Locator {
    return this.frame.locator('input[type="tel"], input[name*="phone" i], input[placeholder*="phone" i]').first();
  }
  message(): Locator {
    return this.frame.locator('textarea, input[name*="message" i], input[placeholder*="message" i]').first();
  }
  checkbox(): Locator {
    return this.frame.locator('input[type="checkbox"]').first();
  }
  submit(): Locator {
    return this.frame.locator('button[type="submit"], input[type="submit"], button:has-text("Submit")').first();
  }
  privacyLink(): Locator {
    return this.frame.locator('a:has-text("Privacy"), a:has-text("privacy")').first();
  }
  anyPrivacyElement(): Locator {
    // Avoid mixing 'text=' engine with CSS comma list (causes parse errors). Use only CSS :has-text and checkbox.
    return this.frame.locator('a:has-text("Privacy"), a:has-text("privacy"), input[type="checkbox"]').first();
  }

  async controlsCount(): Promise<number> {
    return this.frame.locator('form input, form textarea, form select').count();
  }

  async debugSnapshot(label: string) {
    try {
      const emails = await this.email().count();
      const inputs = await this.frame.locator('input').count();
      const visible = await this.frame.locator('input:visible').count();
      console.log(`[hubspotForm][${label}] inputs=${inputs} visibleInputs=${visible} emailCandidates=${emails}`);
    } catch (e) {
      console.log(`[hubspotForm][${label}] debug failed: ${(e as Error).message}`);
    }
  }

  // Try to trigger progressive field reveal (scroll, focus cycling, tabbing)
  async attemptRevealMoreFields(maxCycles = 3): Promise<number> {
    let lastCount = await this.frame.locator('input, textarea').count().catch(()=>0);
    for (let i = 0; i < maxCycles; i++) {
      try {
        await this.frame.locator('body').evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
      } catch { /* ignore */ }
      // Focus last visible input to maybe trigger dynamic injection
      try {
        const lastVisible = this.frame.locator('input:visible').last();
        await lastVisible.focus({ timeout: 1000 }).catch(()=>{});
      } catch { /* ignore */ }
      // Simulate TAB key inside frame by evaluating document.activeElement.nextElementSibling focus chain if needed
      try {
        await this.frame.locator('body').evaluate(() => {
          const active = document.activeElement as HTMLElement | null;
          if (active) active.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
        });
      } catch { /* ignore */ }
      await new Promise(r => setTimeout(r, 500));
      const newCount = await this.frame.locator('input, textarea').count().catch(()=>lastCount);
      if (newCount > lastCount) {
        await this.debugSnapshot(`reveal-cycle-${i}`);
        lastCount = newCount;
      }
    }
    return lastCount;
  }

  // Utility tolerates hidden inputs & iframe reloads by re-acquiring locator each loop if factory provided
  async forceFill(locatorOrFactory: Locator | (() => Locator), value: string) {
    const attempts = 6;
    for (let i = 0; i < attempts; i++) {
      const locator = typeof locatorOrFactory === 'function' ? locatorOrFactory() : locatorOrFactory;
      try {
        await locator.fill(value, { timeout: 4000 });
        return;
      } catch (err) {
        const msg = (err as Error).message || '';
        // Re-check attachment & attempt DOM assignment
        try {
          await locator.waitFor({ state: 'attached', timeout: 1500 }).catch(() => {});
          await locator.evaluate((el, v) => {
            (el as HTMLInputElement | HTMLTextAreaElement).value = v as string;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, value);
          return;
        } catch {
          if (i === attempts - 1) throw new Error(`forceFill failed after ${attempts} attempts. Last error: ${msg}`);
        }
        await new Promise(r => setTimeout(r, 220));
      }
    }
  }

  async forceClick(locatorOrFactory: Locator | (() => Locator)) {
    const attempts = 6;
    for (let i = 0; i < attempts; i++) {
      const locator = typeof locatorOrFactory === 'function' ? locatorOrFactory() : locatorOrFactory;
      try {
        await locator.click({ timeout: 4000 });
        return;
      } catch (err) {
        const msg = (err as Error).message || '';
        try {
          await locator.waitFor({ state: 'attached', timeout: 1500 }).catch(() => {});
          await locator.evaluate((el) => (el as HTMLElement).click());
          return;
        } catch {
          if (i === attempts - 1) throw new Error(`forceClick failed after ${attempts} attempts. Last error: ${msg}`);
        }
        await new Promise(r => setTimeout(r, 220));
      }
    }
  }

  // Field-specific helpers
  async fillEmail(v: string) { await this.forceFill(() => this.email(), v); }
  async fillFirstName(v: string) { await this.forceFill(() => this.firstName(), v); }
  async fillLastName(v: string) { await this.forceFill(() => this.lastName(), v); }
  async fillCompany(v: string) { await this.forceFill(() => this.company(), v); }
  async fillPhone(v: string) { await this.forceFill(() => this.phone(), v); }
  async guardedFillPhone(v: string) {
    const locFactory = () => this.phone();
    const loc = locFactory();
    const exists = await loc.count().then(c=>c>0).catch(()=>false);
    if (!exists) return; // silently skip if field absent in this variant
    // Try gentle slow type first (some masks rely on key events)
    try {
      await loc.click({ timeout: 3000 });
      for (const ch of v) {
        await loc.type(ch, { delay: 40 });
      }
      const val = await loc.inputValue().catch(()=> '');
      if (val.replace(/\D/g,'').length >= 6) return; // good enough
    } catch { /* fall through */ }
    // Fallback to forceFill cycles
    await this.forceFill(locFactory, v);
  }
  async fillMessage(v: string) { await this.forceFill(() => this.message(), v); }
  async clickSubmit() { await this.forceClick(() => this.submit()); }

  async expectBasicPresence() {
    await expect(this.email()).toBeAttached();
  }
}
