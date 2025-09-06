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
    return this.page.locator('img[alt*="ResortPass"], img[alt*="logo"], [aria-label*="logo"]').first();
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
    return this.page.locator('[data-testid="modal-close"], .modal-close, [aria-label*="close"]');
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
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
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
    const cookieBanner = this.page.locator('[data-testid="cookie-banner"], .cookie-banner, [aria-label*="cookie"]');
    if (await cookieBanner.isVisible()) {
      // Look for accept button with specific text
      const acceptButton = cookieBanner.getByRole('button', { name: 'Accept All Cookies' });
      if (await acceptButton.isVisible()) {
        await acceptButton.click();
        await cookieBanner.waitFor({ state: 'hidden' });
      } else {
        // Fallback to any accept-like button
        const fallbackAccept = cookieBanner.getByRole('button', { name: /accept/i }).first();
        if (await fallbackAccept.isVisible()) {
          await fallbackAccept.click();
          await cookieBanner.waitFor({ state: 'hidden' });
        }
      }
    }
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
