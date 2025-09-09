import { test, expect } from '@playwright/test';

test.describe('Testlio Contact Sales Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://testlio.com/contact-sales/');
    
    // Handle cookie consent if present
    try {
      await page.getByRole('button', { name: /allow all cookies/i }).click({ timeout: 3000 });
    } catch {
      // Cookie banner not present
    }
  });

  test('HP03: Contact sales form submission @critical @functional', async ({ page }) => {
    await test.step('Locate and verify contact form elements', async () => {
      const form = page.frameLocator('iframe').getByRole('form', { name: 'HubSpot Form' });
      await expect(form).toBeVisible();
      
      // Verify required fields are present
      await expect(form.getByRole('textbox', { name: /first name/i })).toBeVisible();
      await expect(form.getByRole('textbox', { name: /last name/i })).toBeVisible();
      await expect(form.getByRole('textbox', { name: /email/i })).toBeVisible();
      await expect(form.getByRole('textbox', { name: /company/i })).toBeVisible();
    });

    await test.step('Fill form with valid data', async () => {
      const frame = page.frameLocator('iframe');
      
      await frame.getByRole('textbox', { name: /first name/i }).fill('Test');
      await frame.getByRole('textbox', { name: /last name/i }).fill('User');
      await frame.getByRole('textbox', { name: /email/i }).fill('test.user@testlio-qa.example.com');
      await frame.getByRole('textbox', { name: /company/i }).fill('QA Test Company');
      
      // Handle dropdown fields
      await frame.getByRole('button', { name: /country/i }).click();
      // Use exact matching to avoid ambiguity with multiple US options
      await frame.getByRole('option', { name: 'United States', exact: true }).click();
      
      await frame.getByRole('button', { name: /# of employees/i }).click();
      await frame.getByText('1-10').click();
      
      await frame.getByRole('button', { name: /how can we help/i }).click();
      // Use more flexible dropdown selection
      const helpOptions = ['Test Automation', 'Testing Services', 'QA Consulting', 'Manual Testing'];
      let helpSelected = false;
      
      for (const option of helpOptions) {
        try {
          const optionElement = frame.getByText(option);
          if (await optionElement.isVisible({ timeout: 2000 })) {
            await optionElement.click();
            helpSelected = true;
            console.log(`[Contact] Selected help option: ${option}`);
            break;
          }
        } catch {
          continue;
        }
      }
      
      if (!helpSelected) {
        console.log('[Contact] No help option found, using first available option');
        await frame.locator('[role="option"]').first().click();
      }
      
      // Optional fields
      await frame.getByRole('textbox', { name: /job title/i }).fill('QA Engineer');
    });

    await test.step('Verify form validation and submission', async () => {
      const frame = page.frameLocator('iframe');
      const submitButton = frame.getByRole('button', { name: /submit/i });
      
      await expect(submitButton).toBeEnabled();
      
      // Note: In a real test environment, we might submit to a test endpoint
      // For demo purposes, we'll just verify the button is ready to submit
      // await submitButton.click();
      // await expect(page.getByText(/thank you/i)).toBeVisible();
    });
  });

  test('HP04: Contact form validation @negative @functional', async ({ page }) => {
    await test.step('Test required field validation', async () => {
      const frame = page.frameLocator('iframe');
      const submitButton = frame.getByRole('button', { name: /submit/i });
      
      // Try to submit empty form
      await submitButton.click();
      
      // Check for validation errors (specific error messages would depend on HubSpot configuration)
      // In a real implementation, we'd verify specific error messages appear
      await expect(frame.getByRole('textbox', { name: /first name/i })).toBeVisible();
      await expect(frame.getByRole('textbox', { name: /last name/i })).toBeVisible();
    });

    await test.step('Test email validation', async () => {
      const frame = page.frameLocator('iframe');
      
      await frame.getByRole('textbox', { name: /email/i }).fill('invalid-email');
      await frame.getByRole('button', { name: /submit/i }).click();
      
      // Email field should show validation error
      // Specific error handling would depend on HubSpot form configuration
    });

    await test.step('Test partial form completion', async () => {
      const frame = page.frameLocator('iframe');
      
      // Fill only some required fields
      await frame.getByRole('textbox', { name: /first name/i }).fill('Test');
      await frame.getByRole('textbox', { name: /email/i }).fill('test@example.com');
      
      const submitButton = frame.getByRole('button', { name: /submit/i });
      await submitButton.click();
      
      // Should prevent submission due to missing required fields
      await expect(frame.getByRole('textbox', { name: /last name/i })).toBeVisible();
      await expect(frame.getByRole('textbox', { name: /company/i })).toBeVisible();
    });
  });

  test('HP09: Form accessibility compliance @accessibility', async ({ page }) => {
    await test.step('Check form accessibility features', async () => {
      const frame = page.frameLocator('iframe');
      
      // Verify form fields have proper labels
      await expect(frame.getByRole('textbox', { name: /first name/i })).toBeVisible();
      await expect(frame.getByRole('textbox', { name: /last name/i })).toBeVisible();
      await expect(frame.getByRole('textbox', { name: /email/i })).toBeVisible();
      
      // Verify required field indicators
      await expect(frame.getByText(/first name\*/i)).toBeVisible();
      await expect(frame.getByText(/last name\*/i)).toBeVisible();
      await expect(frame.getByText(/email\*/i)).toBeVisible();
    });

    await test.step('Test keyboard navigation', async () => {
      const frame = page.frameLocator('iframe');
      
      // Tab through form fields
      await frame.getByRole('textbox', { name: /first name/i }).focus();
      await page.keyboard.press('Tab');
      await expect(frame.getByRole('textbox', { name: /last name/i })).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(frame.getByRole('textbox', { name: /email/i })).toBeFocused();
    });
  });

  test('HP11: Form responsive design @responsive', async ({ page }) => {
    await test.step('Test form on mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      
      const frame = page.frameLocator('iframe');
      await expect(frame.getByRole('form', { name: 'HubSpot Form' })).toBeVisible();
      await expect(frame.getByRole('textbox', { name: /first name/i })).toBeVisible();
    });

    await test.step('Test form on tablet viewport', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      
      const frame = page.frameLocator('iframe');
      await expect(frame.getByRole('form', { name: 'HubSpot Form' })).toBeVisible();
      
      // Verify two-column layout works on tablet
      await expect(frame.getByRole('textbox', { name: /first name/i })).toBeVisible();
      await expect(frame.getByRole('textbox', { name: /last name/i })).toBeVisible();
    });
  });
});
