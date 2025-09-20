import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Header navigation elements
  get header() {
    return this.page.locator('nav, [role="navigation"], .navigation').first();
  }

  get logo() {
    return this.page.getByRole('link', { name: 'Resortpass logo' });
  }

  get loginButton() {
    return this.page.getByRole('button', { name: /login|sign in/i });
  }

  get signUpButton() {
    return this.page.getByRole('button', { name: /sign up|register/i });
  }

  get userMenu() {
    return this.page.locator('[data-testid="user-menu"], .user-menu');
  }

  get cartIcon() {
    return this.page.locator('[data-testid="cart"], .cart, [aria-label*="cart"]');
  }

  // Footer elements
  get footer() {
    return this.page.locator('footer, [data-testid="footer"], .footer');
  }

  // Mobile navigation
  get mobileMenuButton() {
    return this.page.locator('[data-testid="mobile-menu"], .mobile-menu-button, [aria-label*="menu"]');
  }

  get mobileMenu() {
    return this.page.locator('[data-testid="mobile-nav"], .mobile-navigation');
  }

  // Common modals and overlays
  get modal() {
    return this.page.locator('[role="dialog"], .modal, [data-testid="modal"]');
  }

  get modalCloseButton() {
    return this.page.locator('[data-testid="modal-close"], .modal-close, [aria-label*="close"]').first();
  }

  get overlay() {
    return this.page.locator('.overlay, [data-testid="overlay"]');
  }

  // Loading states
  get loadingSpinner() {
    return this.page.locator('[data-testid="loading"], .loading, .spinner');
  }

  // Error messages
  get errorMessage() {
    return this.page.locator('[data-testid="error"], .error-message, [role="alert"]');
  }

  get successMessage() {
    return this.page.locator('[data-testid="success"], .success-message');
  }

  // Common actions
  async goto(url?: string) {
    await this.page.goto(url || '/');
    // After navigation, give page a short moment to surface any overlays
    await this.waitForPageLoad();
    // Try to dismiss common overlays so tests can interact reliably
    await this.dismissOverlays();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async closeModal() {
    if (await this.modal.isVisible()) {
      // Try multiple methods to close modal
      if (await this.modalCloseButton.isVisible()) {
        await this.modalCloseButton.click();
      } else {
        await this.page.keyboard.press('Escape');
      }
      await this.modal.waitFor({ state: 'hidden' });
    }
  }

  async dismissCookieBanner() {
    // Wait a moment for cookie banner to potentially appear
    await this.page.waitForTimeout(1500);
    
    // Look for cookie banners with broader selectors including OneTrust
    const cookieBanner = this.page.locator('[data-testid="cookie-banner"], .cookie-banner, [aria-label*="cookie"], .cookie-consent, #cookie-consent, .gdpr, .cookie-consent-banner, .onetrust-banner-sdk, #onetrust-banner-sdk');
    
    // Wait for cookie banner to be visible (with timeout)
    try {
      await cookieBanner.first().waitFor({ state: 'visible', timeout: 3000 });
    } catch (e) {
      // Cookie banner might not appear, that's ok
      return;
    }
    
    if (await cookieBanner.first().isVisible()) {
      // Primary: Look for "Accept All Cookies" button (proven to work from investigation)
      const acceptAllButton = this.page.getByRole('button', { name: 'Accept All Cookies' });
      if (await acceptAllButton.isVisible()) {
        await acceptAllButton.click();
        await cookieBanner.first().waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
        return;
      }

      // OneTrust specific selectors (common cookie consent platform)
      const oneTrustSelectors = [
        '#onetrust-accept-btn-handler',
        '.onetrust-accept-btn-handler',
        'button[id*="accept-btn-handler"]'
      ];
      
      for (const selector of oneTrustSelectors) {
        const button = this.page.locator(selector);
        if (await button.count() && await button.first().isVisible()) {
          await button.first().click().catch(() => {});
          await cookieBanner.first().waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
          return;
        }
      }

      // Simplified fallbacks for common patterns
      const fallbackAccept = cookieBanner.getByRole('button', { name: /accept all|accept|agree|allow all|continue/i }).first();
      if (await fallbackAccept.isVisible()) {
        await fallbackAccept.click().catch(() => {});
        await cookieBanner.first().waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
        return;
      }
      
      // Last resort: press Escape
      await this.page.keyboard.press('Escape').catch(() => {});
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Attempt to dismiss common overlays that can block interactions.
   * Simplified approach based on site investigation: focus on cookie banner
   * and basic modals, with emergency CSS class removal fallback.
   */
  async dismissOverlays(timeout = 1500) {
    // Wait briefly for any delayed overlays to appear
    await this.page.waitForTimeout(2000);
    
    // Primary: Handle cookie banner (main blocking overlay identified)
    try {
      await this.dismissCookieBanner();
    } catch (e) {
      // Best-effort, continue if cookie banner handling fails
    }

    // Secondary: Handle any modal dialogs
    try {
      await this.closeModal();
    } catch (e) {
      // Best-effort, continue if modal handling fails
    }

    // Basic overlay dismissal for common patterns
    const commonOverlaySelectors = [
      '[role="dialog"]',
      '.modal',
      '.popup'
    ];

    for (const selector of commonOverlaySelectors) {
      try {
        const overlay = this.page.locator(selector);
        const count = await overlay.count();
        
        for (let i = 0; i < count; i++) {
          const item = overlay.nth(i);
          if (!(await item.isVisible())) continue;

          // Try to find and click close button
          const closeButton = item.locator('.close, [data-testid="close"], button[aria-label*="close"], button:has-text("Close"), button:has-text("×")').first();
          if (await closeButton.count() && await closeButton.isVisible()) {
            await closeButton.click({ timeout: 1000 }).catch(() => {});
            await item.waitFor({ state: 'hidden', timeout: 1000 }).catch(() => {});
          } else {
            // Fallback: press Escape
            await this.page.keyboard.press('Escape');
            await this.page.waitForTimeout(300);
          }
        }
      } catch (e) {
        // Continue with other selectors if one fails
      }
    }

    // Emergency fallback: Remove CSS classes that block page interaction
    // This addresses the specific issue found in ResortPass where scrolling gets disabled
    try {
      const wasBlocked = await this.page.evaluate(() => {
        const blockingClasses = ['box_active_disable_scrolling', 'modal-open', 'no-scroll'];
        let removedAny = false;
        
        for (const className of blockingClasses) {
          if (document.documentElement.classList.contains(className)) {
            document.documentElement.classList.remove(className);
            removedAny = true;
          }
          if (document.body.classList.contains(className)) {
            document.body.classList.remove(className);
            removedAny = true;
          }
        }
        
        return removedAny;
      });
      
      if (wasBlocked) {
        // Allow layout to settle after removing blocking classes
        await this.page.waitForTimeout(500);
        
        // Try to dismiss any remaining visible overlays
        const remainingCloseButtons = this.page.locator('button:has-text("×"), button:has-text("Close"), button[aria-label*="close"]');
        const closeCount = await remainingCloseButtons.count();
        
        for (let i = 0; i < Math.min(closeCount, 2); i++) {
          try {
            await remainingCloseButtons.nth(i).click({ timeout: 800 });
            await this.page.waitForTimeout(200);
          } catch (e) {
            // Continue to next close button if one fails
          }
        }
      }
    } catch (e) {
      // Emergency fallback failed, continue anyway
    }

    // Short wait to let UI settle
    await this.page.waitForTimeout(Math.min(timeout, 1000));
  }

  async waitForElement(locator: Locator, timeout = 10000) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async scrollToElement(locator: Locator) {
    await locator.scrollIntoViewIfNeeded();
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  // Validation helpers
  async expectElementVisible(locator: Locator) {
    await expect(locator).toBeVisible();
  }

  async expectElementHidden(locator: Locator) {
    await expect(locator).toBeHidden();
  }

  async expectTextContent(locator: Locator, text: string) {
    await expect(locator).toContainText(text);
  }

  // URL and navigation helpers
  async expectURL(expectedURL: string) {
    await expect(this.page).toHaveURL(expectedURL);
  }

  async getCurrentURL(): Promise<string> {
    return this.page.url();
  }

  // Form helpers
  async fillField(locator: Locator, value: string) {
    await locator.clear();
    await locator.fill(value);
  }

  async selectOption(locator: Locator, value: string) {
    await locator.selectOption(value);
  }

  // Mobile responsiveness helpers
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  async setTabletViewport() {
    await this.page.setViewportSize({ width: 768, height: 1024 });
  }
}
