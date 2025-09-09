import { test, expect } from '@playwright/test';
import { authHandler } from '../utils/authRateLimitHandler';

test.describe('Authentication Rate Limiting Protection Demo', () => {

  test('DEMO: Rate limiting protection in action @demo @rate-limiting', async ({ page }) => {
    console.log('\n=== RATE LIMITING PROTECTION DEMO ===\n');
    
    await test.step('Navigate to login page', async () => {
      await page.goto('https://platform.testlio.com/login');
      console.log('[Demo] Navigated to login page');
    });

    await test.step('Show current rate limit status', async () => {
      const status = authHandler.getStatus();
      console.log('[Demo] Initial rate limit status:', JSON.stringify(status, null, 2));
    });

    await test.step('Attempt multiple login scenarios', async () => {
      const testScenarios = [
        { email: 'test1@example.com', password: 'wrongpass1' },
        { email: 'test2@example.com', password: 'wrongpass2' },
        { email: 'test3@example.com', password: 'wrongpass3' }
      ];

      for (let i = 0; i < testScenarios.length; i++) {
        const scenario = testScenarios[i];
        console.log(`\n[Demo] Attempt ${i + 1}: ${scenario.email}`);
        
        const result = await authHandler.safeLoginAttempt(
          page, 
          scenario.email, 
          scenario.password
        );

        console.log(`[Demo] Result: success=${result.success}, rateLimited=${result.rateLimited}`);
        
        if (result.rateLimited) {
          console.log('[Demo] 🚨 Rate limiting detected! Switching to UI-only validation.');
          break;
        }

        // Small delay between attempts
        await page.waitForTimeout(500);
      }
    });

    await test.step('Show final rate limit status', async () => {
      const finalStatus = authHandler.getStatus();
      console.log('[Demo] Final rate limit status:', JSON.stringify(finalStatus, null, 2));
      
      if (authHandler.shouldSkipLogin()) {
        console.log('[Demo] 🛡️ Rate limit protection active - future tests will use UI validation only');
      } else {
        console.log('[Demo] ✅ No rate limiting detected - normal testing can continue');
      }
    });

    await test.step('Demonstrate UI-only validation fallback', async () => {
      console.log('\n[Demo] Demonstrating UI-only validation as fallback...');
      
      const uiValid = await authHandler.validateAuthUI(page);
      console.log(`[Demo] UI validation result: ${uiValid ? '✅ PASS' : '❌ FAIL'}`);
      
      expect(uiValid).toBe(true);
    });

    console.log('\n=== DEMO COMPLETED ===\n');
  });

  test('Reset rate limit context for clean slate @utility', async ({ }) => {
    // This test can be used to reset the rate limit context if needed
    await test.step('Reset rate limiting context', async () => {
      authHandler.resetRateLimit();
      console.log('[Utility] Rate limit context has been reset');
      
      const status = authHandler.getStatus();
      expect(status.rateLimitDetected).toBe(false);
      expect(status.failedAttempts).toBe(0);
    });
  });
});
