import { Page } from '@playwright/test';
import { Container } from '../../../automation/core/container';
import { LocatorIntent } from '../../../automation/locators/resolver/intentTypes';
import { siteConfig } from '../infinite.config';

export class BasePage {
  readonly page: Page;
  readonly container: Container;

  constructor(page: Page, container: Container) {
    this.page = page;
    this.container = container;
  }

  async navigate(path: string = '') {
    const url = path ? `${siteConfig.baseURL}${path}` : siteConfig.baseURL;
    
    await this.page.goto(url, { 
      timeout: siteConfig.timeouts.navigation 
    });
    
    // Handle cookie consent using framework locator resolution
    await this.handleCookieConsent();
    
    // Wait for page stabilization
    await this.waitForPageLoad();
  }

  /**
   * Handle cookie consent dialog
   * Based on actual Infinite.com implementation using Cookiebot CMP
   */
  async handleCookieConsent(): Promise<void> {
    try {
      await this.recordTelemetry('action.cookie_consent_start', {});
      
      // Wait for page to stabilize first
      await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      await this.page.waitForTimeout(2000); // Give cookies time to appear

      console.log('Starting cookie consent handling...');
      
      // First, check if CMP widget button exists (Cookiebot pattern)
      const cmpButtonSelector = 'button:has-text("Open CMP widget")';
      const cmpButton = this.page.locator(cmpButtonSelector);
      
      if (await cmpButton.isVisible({ timeout: 3000 })) {
        console.log('Found CMP widget button, clicking to open dialog...');
        await cmpButton.click();
        await this.page.waitForTimeout(1000); // Wait for dialog to open
        
        // Check current cookie state and close dialog (cookies are already allowed by default)
        const closeButton = this.page.locator('button:has-text("Close CMP widget")');
        if (await closeButton.isVisible({ timeout: 2000 })) {
          console.log('Cookies already allowed, closing CMP dialog...');
          await closeButton.click();
          await this.recordTelemetry('action.cookie_consent_accepted', { method: 'cmp_close' });
          return;
        }
      }

      // Check for other cookie dialog patterns (fallback)
      const cookieSelectors = [
        'dialog:has-text("This website uses cookies")',
        '[data-testid*="cookie"]',
        '.cookie-banner',
        '.cookie-consent',
        '.cookie-notice',
        '#cookie-consent',
        '[aria-label*="cookie"]',
        '[role="dialog"]:has-text("cookie")'
      ];
      
      let cookieHandled = false;
      
      for (const selector of cookieSelectors) {
        try {
          const dialog = this.page.locator(selector);
          if (await dialog.isVisible({ timeout: 2000 })) {
            console.log(`Found cookie dialog with selector: ${selector}`);
            
            // Try various accept button patterns
            const acceptButtons = [
              'button:has-text("Allow all")',
              'button:has-text("Accept all")',
              'button:has-text("Accept")',
              'button:has-text("I agree")',
              'button:has-text("I accept")',
              'button:has-text("OK")',
              'button:has-text("Continue")',
              'button[id*="accept"]',
              'button[class*="accept"]',
              '.accept-button',
              '.cookie-accept'
            ];
            
            for (const buttonSelector of acceptButtons) {
              try {
                const button = this.page.locator(buttonSelector);
                if (await button.isVisible({ timeout: 2000 })) {
                  console.log(`Clicking accept button: ${buttonSelector}`);
                  await button.click();
                  await dialog.waitFor({ state: 'hidden', timeout: 8000 });
                  await this.recordTelemetry('action.cookie_consent_accepted', { 
                    dialogSelector: selector,
                    buttonSelector 
                  });
                  cookieHandled = true;
                  break;
                }
              } catch (buttonError) {
                console.log(`Button ${buttonSelector} not clickable: ${buttonError}`);
              }
            }
            
            if (cookieHandled) break;
          }
        } catch (dialogError) {
          console.log(`Dialog ${selector} not found: ${dialogError}`);
        }
      }

      // If no cookie dialog found, that's also OK
      if (!cookieHandled) {
        console.log('No cookie dialog found or cookies already accepted');
        await this.recordTelemetry('action.cookie_consent_accepted', { method: 'no_dialog_found' });
      }

      // Always wait a bit more for any animations/transitions to complete
      await this.page.waitForTimeout(2000);
      
      console.log(`Cookie consent handling completed. Success: ${cookieHandled || 'no dialog needed'}`);
      
    } catch (error) {
      // Cookie consent is optional, continue without failing
      await this.recordTelemetry('action.cookie_consent_failed', { error: String(error) });
      console.log(`Cookie consent handling failed but continuing: ${error}`);
    }
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    
    if (siteConfig.specialHandling.dynamicContent) {
      await this.page.waitForLoadState('networkidle');
    }
  }

  async findElement(intent: LocatorIntent) {
    const locatorResolver = this.container.get('locatorResolver');
    const resolution = await locatorResolver.resolve(intent);
    const validated = await locatorResolver.validateOnPage(
      this.page, 
      resolution, 
      siteConfig.timeouts.validation
    );

    if (validated.best?.validated) {
      return this.page.locator(validated.best.selector);
    }
    
    throw new Error(`Could not locate element: ${intent.target}`);
  }

  async clickElement(intent: LocatorIntent) {
    const element = await this.findElement(intent);
    await element.click({ timeout: siteConfig.timeouts.action });
  }

  async recordTelemetry(eventType: string, payload: Record<string, unknown>) {
    const telemetry = this.container.get('telemetryCollector');
    telemetry.recordEvent({
      ts: Date.now(),
      type: eventType,
      payload: {
        site: siteConfig.siteName,
        url: this.page.url(),
        ...payload
      }
    });
  }
}