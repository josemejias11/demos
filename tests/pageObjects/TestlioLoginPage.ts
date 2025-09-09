import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Testlio Platform Login page
 * Handles authentication flows and form validation
 */
export class TestlioLoginPage {
  readonly page: Page;
  
  // Page elements
  readonly pageTitle: Locator;
  readonly loginHeading: Locator;
  readonly signUpPrompt: Locator;
  readonly signUpLink: Locator;

  // Form elements
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly passwordToggle: Locator;
  readonly loginButton: Locator;
  readonly resetPasswordLink: Locator;

  // Error and validation elements
  readonly errorMessage: Locator;
  readonly validationErrors: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Page elements
    this.pageTitle = page.locator('title');
    this.loginHeading = page.getByText('Log in to your account.');
    this.signUpPrompt = page.getByText('New to Testlio?');
    this.signUpLink = page.getByRole('link', { name: /sign up/i });

    // Form elements
    this.emailField = page.getByRole('textbox', { name: /email/i });
    this.passwordField = page.getByRole('textbox', { name: /password/i });
    this.passwordToggle = page.locator('img').last(); // Password visibility toggle
    this.loginButton = page.getByRole('button', { name: /log in/i });
    this.resetPasswordLink = page.getByRole('link', { name: /reset password/i });

    // Error elements
    this.errorMessage = page.locator('.error-message, [role="alert"]');
    this.validationErrors = page.locator('.validation-error, .field-error');
  }

  async navigate() {
    await this.page.goto('https://platform.testlio.com/login');
  }

  async login(email: string, password: string) {
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.loginButton.click();
  }

  async clearForm() {
    await this.emailField.clear();
    await this.passwordField.clear();
  }

  async togglePasswordVisibility() {
    if (await this.passwordToggle.isVisible()) {
      await this.passwordToggle.click();
    }
  }

  async clickResetPassword() {
    await this.resetPasswordLink.click();
  }

  async clickSignUp() {
    await this.signUpLink.click();
  }

  async submitWithEnter() {
    await this.passwordField.press('Enter');
  }

  async verifyFormElements() {
    await this.loginHeading.waitFor();
    await this.emailField.waitFor();
    await this.passwordField.waitFor();
    await this.loginButton.waitFor();
    await this.resetPasswordLink.waitFor();
    await this.signUpLink.waitFor();
  }

  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.loginButton.isEnabled();
  }

  async getPasswordFieldType(): Promise<string | null> {
    return await this.passwordField.getAttribute('type');
  }

  async hasValidationErrors(): Promise<boolean> {
    return await this.validationErrors.isVisible();
  }

  async getErrorMessage(): Promise<string> {
    if (await this.errorMessage.isVisible()) {
      return await this.errorMessage.textContent() || '';
    }
    return '';
  }

  async focusEmail() {
    await this.emailField.focus();
  }

  async focusPassword() {
    await this.passwordField.focus();
  }

  async tabThroughForm(): Promise<string[]> {
    const focusOrder: string[] = [];
    
    await this.emailField.focus();
    focusOrder.push('email');
    
    await this.page.keyboard.press('Tab');
    // Check if password field is focused by evaluating document.activeElement
    const passwordFocused = await this.page.evaluate(() => {
      const activeElement = document.activeElement;
      return activeElement?.getAttribute('type') === 'password' ||
             activeElement?.getAttribute('placeholder')?.toLowerCase().includes('password');
    });
    if (passwordFocused) {
      focusOrder.push('password');
    }
    
    await this.page.keyboard.press('Tab');
    // Check if login button is focused
    const buttonFocused = await this.page.evaluate(() => {
      const activeElement = document.activeElement;
      return activeElement?.textContent?.toLowerCase().includes('log in') ||
             activeElement?.tagName === 'BUTTON';
    });
    if (buttonFocused) {
      focusOrder.push('login-button');
    }
    
    return focusOrder;
  }

  async getSignUpLinkHref(): Promise<string | null> {
    return await this.signUpLink.getAttribute('href');
  }

  async getResetPasswordLinkHref(): Promise<string | null> {
    return await this.resetPasswordLink.getAttribute('href');
  }
}
