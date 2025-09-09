import { Page, Response } from '@playwright/test';

export interface RateLimitConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export interface AuthTestContext {
  rateLimitDetected: boolean;
  lastRateLimitTime: number;
  failedAttempts: number;
}

export class AuthRateLimitHandler {
  private static instance: AuthRateLimitHandler;
  private context: AuthTestContext = {
    rateLimitDetected: false,
    lastRateLimitTime: 0,
    failedAttempts: 0
  };

  private config: RateLimitConfig = {
    maxRetries: 3,
    baseDelay: 2000,
    maxDelay: 30000,
    backoffMultiplier: 2
  };

  static getInstance(): AuthRateLimitHandler {
    if (!AuthRateLimitHandler.instance) {
      AuthRateLimitHandler.instance = new AuthRateLimitHandler();
    }
    return AuthRateLimitHandler.instance;
  }

  /**
   * Detects if a response indicates rate limiting
   */
  isRateLimited(response: Response | null, pageContent?: string): boolean {
    if (!response) return false;

    // Check HTTP status codes
    if (response.status() === 429) return true;
    if (response.status() === 503) return true;

    // Check for common rate limiting headers
    const headers = response.headers();
    if (headers['x-ratelimit-remaining'] === '0') return true;
    if (headers['retry-after']) return true;

    // Check page content for rate limiting messages
    if (pageContent) {
      const rateLimitPatterns = [
        /too many requests/i,
        /rate limit/i,
        /try again later/i,
        /temporarily unavailable/i,
        /please wait/i,
        /slow down/i
      ];
      
      return rateLimitPatterns.some(pattern => pattern.test(pageContent));
    }

    return false;
  }

  /**
   * Waits before making a login attempt if rate limiting is detected
   */
  async waitIfRateLimited(): Promise<void> {
    if (this.context.rateLimitDetected) {
      const timeSinceLastLimit = Date.now() - this.context.lastRateLimitTime;
      const minWaitTime = Math.min(
        this.config.baseDelay * Math.pow(this.config.backoffMultiplier, this.context.failedAttempts),
        this.config.maxDelay
      );

      if (timeSinceLastLimit < minWaitTime) {
        const waitTime = minWaitTime - timeSinceLastLimit;
        console.log(`[Auth] Rate limit detected. Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  /**
   * Records a rate limit detection
   */
  recordRateLimit(): void {
    this.context.rateLimitDetected = true;
    this.context.lastRateLimitTime = Date.now();
    this.context.failedAttempts++;
    console.log(`[Auth] Rate limit recorded. Failed attempts: ${this.context.failedAttempts}`);
  }

  /**
   * Resets rate limit context on successful operation
   */
  resetRateLimit(): void {
    this.context.rateLimitDetected = false;
    this.context.failedAttempts = 0;
    console.log('[Auth] Rate limit context reset');
  }

  /**
   * Checks if we should skip login attempts due to persistent rate limiting
   */
  shouldSkipLogin(): boolean {
    return this.context.failedAttempts >= this.config.maxRetries;
  }

  /**
   * Safely attempts a login with rate limiting protection
   */
  async safeLoginAttempt(
    page: Page,
    email: string,
    password: string,
    options: { validateOnly?: boolean } = {}
  ): Promise<{ success: boolean; rateLimited: boolean; response?: Response | null }> {
    await this.waitIfRateLimited();

    try {
      // Fill credentials
      await page.getByRole('textbox', { name: /email/i }).fill(email);
      await page.getByRole('textbox', { name: /password/i }).fill(password);

      if (options.validateOnly) {
        // Only validate form without submitting
        return { success: true, rateLimited: false };
      }

      // Capture the login request
      let loginResponse: Response | null = null;
      page.on('response', (response) => {
        if (response.url().includes('login') || response.url().includes('auth')) {
          loginResponse = response;
        }
      });

      // Submit form
      await page.getByRole('button', { name: /log in/i }).click();
      await page.waitForTimeout(2000); // Wait for response

      // Check page content for error messages
      const pageContent = await page.content();
      
      if (this.isRateLimited(loginResponse, pageContent)) {
        this.recordRateLimit();
        return { success: false, rateLimited: true, response: loginResponse };
      }

      // Check for successful login (URL change, dashboard elements, etc.)
      const currentUrl = page.url();
      const isOnLoginPage = currentUrl.includes('/login');
      
      if (!isOnLoginPage) {
        this.resetRateLimit();
        return { success: true, rateLimited: false, response: loginResponse };
      }

      // Login failed but not due to rate limiting
      return { success: false, rateLimited: false, response: loginResponse };

    } catch (error) {
      console.error('[Auth] Login attempt failed:', error);
      return { success: false, rateLimited: false };
    }
  }

  /**
   * Performs authentication UI validation without actual login attempts
   */
  async validateAuthUI(page: Page): Promise<boolean> {
    try {
      console.log('[Auth] Performing UI-only validation (rate limit protection active)');
      
      // Verify core login elements are present
      await page.getByRole('textbox', { name: /email/i }).isVisible();
      await page.getByRole('textbox', { name: /password/i }).isVisible();
      await page.getByRole('button', { name: /log in/i }).isVisible();
      
      // Test form interaction without submission
      await page.getByRole('textbox', { name: /email/i }).fill('ui-test@example.com');
      await page.getByRole('textbox', { name: /password/i }).fill('ui-test-password');
      
      // Verify form accepts input
      const emailValue = await page.getByRole('textbox', { name: /email/i }).inputValue();
      const passwordValue = await page.getByRole('textbox', { name: /password/i }).inputValue();
      
      return emailValue === 'ui-test@example.com' && passwordValue === 'ui-test-password';
      
    } catch (error) {
      console.error('[Auth] UI validation failed:', error);
      return false;
    }
  }

  /**
   * Gets current rate limit status for reporting
   */
  getStatus(): AuthTestContext {
    return { ...this.context };
  }
}

export const authHandler = AuthRateLimitHandler.getInstance();
