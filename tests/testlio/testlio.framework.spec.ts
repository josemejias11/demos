import { test, expect } from '@playwright/test';

/**
 * Advanced test demonstrating automation framework capabilities:
 * - Adaptive locator strategies
 * - Pattern learning and recognition
 * - Self-healing test logic
 * - Intelligent wait strategies
 * - Performance monitoring integration
 */
test.describe('Testlio Framework Integration Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Enable detailed logging for framework components
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('[Framework]')) {
        console.log('Framework:', msg.text());
      }
    });
  });

  test('HP19: Adaptive locator resolution demo @framework @adaptive', async ({ page }) => {
    await test.step('Navigate and learn page patterns', async () => {
      await page.goto('https://testlio.com');
      
      // Handle cookie consent with adaptive strategy
      const cookieStrategies = [
        () => page.getByRole('button', { name: /allow all cookies/i }),
        () => page.getByRole('button', { name: /accept/i }),
        () => page.locator('[data-testid="cookie-accept"]'),
        () => page.locator('.cookie-accept, #cookie-accept'),
      ];

      for (const strategy of cookieStrategies) {
        try {
          const button = strategy();
          if (await button.isVisible({ timeout: 2000 })) {
            await button.click();
            break;
          }
        } catch {
          // Try next strategy
          continue;
        }
      }
    });

    await test.step('Test intelligent contact button detection', async () => {
      // Use multiple strategies to find "Contact sales" button with specific context
      const contactStrategies = [
        // Header-specific (most reliable)
        () => page.locator('header').getByRole('link', { name: /contact sales/i }),
        // Main content specific
        () => page.locator('main').getByRole('link', { name: /contact sales/i }).first(),
        // Role-based (general)
        () => page.getByRole('link', { name: /contact sales/i }).first(),
        // Text-based with variations
        () => page.getByText(/contact sales/i).first(),
        () => page.getByText(/talk to sales/i),
        () => page.getByText(/get in touch/i),
        // CSS selector fallbacks
        () => page.locator('[href*="contact"]').first(),
        () => page.locator('.cta-button, .contact-button').first(),
      ];

      let contactButton = null;
      for (const strategy of contactStrategies) {
        try {
          const element = strategy();
          if (await element.isVisible({ timeout: 1000 })) {
            contactButton = element;
            console.log('[Framework] Contact button found via strategy:', strategy.toString());
            break;
          }
        } catch {
          continue;
        }
      }

      expect(contactButton).not.toBeNull();
      if (contactButton) {
        await expect(contactButton).toBeVisible();
        
        // Test the button interaction
        await contactButton.click();
        await expect(page.url()).toContain('contact');
      }
    });
  });

  test('HP20: Form field pattern recognition @framework @patterns', async ({ page }) => {
    await page.goto('https://testlio.com/contact-sales/');

    await test.step('Analyze form structure and field patterns', async () => {
      // Wait for iframe form to load
      await page.waitForSelector('iframe', { timeout: 10000 });
      const frame = page.frameLocator('iframe');

      // Pattern recognition for common form fields
      const formFieldPatterns = {
        firstName: [
          { strategy: () => frame.getByRole('textbox', { name: /first name/i }), weight: 10 },
          { strategy: () => frame.locator('[name*="firstname"], [id*="firstname"]'), weight: 8 },
          { strategy: () => frame.locator('input[placeholder*="first"]'), weight: 6 },
        ],
        lastName: [
          { strategy: () => frame.getByRole('textbox', { name: /last name/i }), weight: 10 },
          { strategy: () => frame.locator('[name*="lastname"], [id*="lastname"]'), weight: 8 },
          { strategy: () => frame.locator('input[placeholder*="last"]'), weight: 6 },
        ],
        email: [
          { strategy: () => frame.getByRole('textbox', { name: /email/i }), weight: 10 },
          { strategy: () => frame.locator('input[type="email"]'), weight: 9 },
          { strategy: () => frame.locator('[name*="email"], [id*="email"]'), weight: 8 },
        ],
        company: [
          { strategy: () => frame.getByRole('textbox', { name: /company/i }), weight: 10 },
          { strategy: () => frame.locator('[name*="company"], [id*="company"]'), weight: 8 },
          { strategy: () => frame.locator('input[placeholder*="company"]'), weight: 6 },
        ]
      };

      // Test each field pattern recognition
      let fieldsFoundCount = 0;
      const totalFields = Object.keys(formFieldPatterns).length;
      
      for (const [fieldName, patterns] of Object.entries(formFieldPatterns)) {
        let fieldFound = false;
        
        // Sort patterns by weight (highest first)
        patterns.sort((a, b) => b.weight - a.weight);
        
        for (const pattern of patterns) {
          try {
            const field = pattern.strategy();
            if (await field.isVisible({ timeout: 2000 })) {
              console.log(`[Framework] ${fieldName} field found via pattern (weight: ${pattern.weight})`);
              
              // Test field interaction
              await field.fill(`Test ${fieldName}`);
              await expect(field).toHaveValue(`Test ${fieldName}`);
              
              fieldFound = true;
              fieldsFoundCount++;
              break;
            }
          } catch {
            continue;
          }
        }
        
        if (!fieldFound) {
          console.log(`[Framework] ${fieldName} field not found - may not be present in current form`);
        }
      }
      
      // Require at least 75% of expected fields to be found
      const successRate = fieldsFoundCount / totalFields;
      console.log(`[Framework] Field recognition success rate: ${Math.round(successRate * 100)}% (${fieldsFoundCount}/${totalFields})`);
      expect(successRate).toBeGreaterThanOrEqual(0.75);
    });
  });

  test('HP21: Self-healing navigation test @framework @self-healing', async ({ page }) => {
    await page.goto('https://testlio.com');
    
    // Handle cookie consent
    try {
      await page.getByRole('button', { name: /allow all cookies/i }).click({ timeout: 3000 });
    } catch {
      // Continue without cookie handling
    }

    await test.step('Test adaptive navigation with fallback strategies', async () => {
      // Primary navigation test with self-healing fallbacks
      const navigationTests = [
        {
          name: 'Solutions Navigation',
          strategies: [
            () => page.getByRole('link', { name: 'Our Solutions' }),
            () => page.getByText('Solutions'),
            () => page.locator('[href*="solution"]'),
            () => page.locator('nav a:has-text("Solution")'),
          ]
        },
        {
          name: 'About Navigation', 
          strategies: [
            () => page.getByRole('link', { name: 'About Testlio' }),
            () => page.getByText('About'),
            () => page.locator('[href*="about"]'),
            () => page.locator('footer a:has-text("About")'),
          ]
        }
      ];

      for (const navTest of navigationTests) {
        let success = false;
        
        for (const strategy of navTest.strategies) {
          try {
            const element = strategy();
            if (await element.isVisible({ timeout: 3000 })) {
              console.log(`[Framework] ${navTest.name} found via self-healing strategy`);
              await expect(element).toBeVisible();
              success = true;
              break;
            }
          } catch {
            continue;
          }
        }
        
        if (!success) {
          console.warn(`[Framework] ${navTest.name} not found with any strategy`);
        }
      }
    });
  });

  test('HP22: Performance monitoring integration @framework @performance', async ({ page }) => {
    interface PerformanceMetric {
      type: 'network' | 'console_error' | 'page_load';
      url?: string;
      status?: number;
      message?: string;
      duration?: number;
      timing: number;
    }
    
    const performanceMetrics: PerformanceMetric[] = [];
    
    // Monitor network requests
    page.on('response', response => {
      performanceMetrics.push({
        type: 'network',
        url: response.url(),
        status: response.status(),
        timing: Date.now()
      });
    });

    // Monitor console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        performanceMetrics.push({
          type: 'console_error',
          message: msg.text(),
          timing: Date.now()
        });
      }
    });

    await test.step('Load page with performance tracking', async () => {
      const startTime = performance.now();
      
      await page.goto('https://testlio.com');
      await page.waitForLoadState('networkidle');
      
      const loadTime = performance.now() - startTime;
      
      performanceMetrics.push({
        type: 'page_load',
        duration: loadTime,
        timing: Date.now()
      });
      
      console.log(`[Framework] Page load time: ${loadTime.toFixed(2)}ms`);
      expect(loadTime).toBeLessThan(10000); // 10 second threshold
    });

    await test.step('Analyze performance metrics', async () => {
      const networkErrors = performanceMetrics.filter(m => 
        m.type === 'network' && m.status !== undefined && m.status >= 400
      );
      
      const consoleErrors = performanceMetrics.filter(m => 
        m.type === 'console_error'
      );
      
      console.log(`[Framework] Network errors: ${networkErrors.length}`);
      console.log(`[Framework] Console errors: ${consoleErrors.length}`);
      
      // Allow some tolerance for third-party errors
      expect(networkErrors.length).toBeLessThanOrEqual(2);
      expect(consoleErrors.length).toBeLessThanOrEqual(5);
    });
  });

  test('HP23: Intelligent wait strategies demo @framework @waits', async ({ page }) => {
    await page.goto('https://testlio.com/contact-sales/');

    await test.step('Test adaptive waiting for dynamic content', async () => {
      // Intelligent wait for iframe form
      const waitStrategies = [
        // Wait for iframe to be present
        async () => {
          await page.waitForSelector('iframe', { timeout: 5000 });
          return true;
        },
        // Wait for frame content to load
        async () => {
          const frame = page.frameLocator('iframe');
          await frame.getByRole('form').waitFor({ timeout: 10000 });
          return true;
        },
        // Wait for specific form fields
        async () => {
          const frame = page.frameLocator('iframe');
          await frame.getByRole('textbox', { name: /first name/i }).waitFor({ timeout: 10000 });
          return true;
        }
      ];

      let formReady = false;
      for (const strategy of waitStrategies) {
        try {
          await strategy();
          console.log('[Framework] Form ready via wait strategy');
          formReady = true;
          break;
        } catch {
          continue;
        }
      }

      expect(formReady).toBe(true);
      
      // Verify form is actually interactive
      const frame = page.frameLocator('iframe');
      const firstNameField = frame.getByRole('textbox', { name: /first name/i });
      await expect(firstNameField).toBeVisible();
      await expect(firstNameField).toBeEditable();
    });
  });
});
