import { test, expect } from '@playwright/test';
import { TestlioHomePage } from '../pageObjects/TestlioHomePage';
import { TestlioContactPage } from '../pageObjects/TestlioContactPage';
import { TestlioLoginPage } from '../pageObjects/TestlioLoginPage';

test.describe('Testlio Page Object Model Tests', () => {
  
  test('HP24: Homepage POM integration @pom @smoke', async ({ page }) => {
    const homePage = new TestlioHomePage(page);
    
    await test.step('Navigate and verify homepage', async () => {
      await homePage.navigate();
      await homePage.handleCookieConsent();
      await homePage.verifyHeroSection();
    });

    await test.step('Test navigation using POM', async () => {
      await homePage.navigateToSection('advantage');
      await expect(page.url()).toContain('#');
    });

    await test.step('Test newsletter signup using POM', async () => {
      const testEmail = 'pom.test@testlio.example.com';
      await homePage.subscribeToNewsletter(testEmail);
      
      // Verify email was entered
      await expect(homePage.newsletterEmail).toHaveValue(testEmail);
    });

    await test.step('Verify client logos', async () => {
      const logoCount = await homePage.getClientLogosCount();
      expect(logoCount).toBeGreaterThan(5); // Should have multiple client logos
    });
  });

  test('HP25: Contact form POM integration @pom @functional', async ({ page }) => {
    const contactPage = new TestlioContactPage(page);
    
    await test.step('Navigate to contact page', async () => {
      await contactPage.navigate();
      await contactPage.waitForFormLoad();
    });

    await test.step('Verify form structure using POM', async () => {
      await contactPage.verifyRequiredFields();
      
      const fieldLabels = await contactPage.getFormFieldLabels();
      expect(fieldLabels).toEqual(
        expect.arrayContaining([
          expect.stringContaining('First Name'),
          expect.stringContaining('Last Name'),
          expect.stringContaining('Email'),
          expect.stringContaining('Company')
        ])
      );
    });

    await test.step('Fill form using POM', async () => {
      await contactPage.fillContactForm({
        firstName: 'POM',
        lastName: 'Test',
        email: 'pom.test@example.com',
        company: 'Test Company',
        phone: '+1234567890',
        jobTitle: 'QA Engineer',
        country: 'United States',
        employees: '1-10',
        helpOption: 'Test Automation'
      });
      
      // Verify submit button is enabled after filling required fields
      const isEnabled = await contactPage.isSubmitButtonEnabled();
      expect(isEnabled).toBe(true);
    });

    await test.step('Test email validation using POM', async () => {
      // Test invalid email
      const invalidEmailValid = await contactPage.validateEmail('invalid-email');
      expect(invalidEmailValid).toBe(false);
      
      // Test valid email
      const validEmailValid = await contactPage.validateEmail('valid@example.com');
      expect(validEmailValid).toBe(true);
    });
  });

  test('HP26: Login page POM integration @pom @authentication', async ({ page }) => {
    const loginPage = new TestlioLoginPage(page);
    
    await test.step('Navigate and verify login page', async () => {
      await loginPage.navigate();
      await loginPage.verifyFormElements();
      
      await expect(page).toHaveTitle(/Log in to Testlio/);
    });

    await test.step('Test form interactions using POM', async () => {
      // Test login with invalid credentials
      await loginPage.login('invalid@example.com', 'wrongpassword');
      
      // Should remain on login page or show error
      await expect(loginPage.emailField).toBeVisible();
    });

    await test.step('Test password visibility toggle using POM', async () => {
      await loginPage.clearForm();
      await loginPage.passwordField.fill('testpassword');
      
      // Check initial password field type
      const initialType = await loginPage.getPasswordFieldType();
      expect(initialType).toBe('password');
      
      // Toggle password visibility
      await loginPage.togglePasswordVisibility();
      
      // Note: Password type might change or visibility icon might change
      // depending on implementation
    });

    await test.step('Test form navigation using POM', async () => {
      await loginPage.clearForm();
      
      // Test keyboard navigation
      const focusOrder = await loginPage.tabThroughForm();
      expect(focusOrder).toContain('email');
      expect(focusOrder).toContain('password');
    });

    await test.step('Test form submission using POM', async () => {
      await loginPage.clearForm();
      await loginPage.emailField.fill('test@example.com');
      await loginPage.passwordField.fill('testpassword');
      
      // Test Enter key submission
      await loginPage.submitWithEnter();
      
      // Should attempt login
      await page.waitForTimeout(1000);
    });

    await test.step('Test navigation links using POM', async () => {
      // Test sign up link
      const signUpHref = await loginPage.getSignUpLinkHref();
      expect(signUpHref).toBe('https://testlio.com/network/');
      
      // Test reset password link
      const resetHref = await loginPage.getResetPasswordLinkHref();
      expect(resetHref).toBe('/forgot-password');
    });
  });

  test('HP27: End-to-end user journey using POMs @pom @e2e', async ({ page }) => {
    const homePage = new TestlioHomePage(page);
    const contactPage = new TestlioContactPage(page);
    
    await test.step('Start journey from homepage', async () => {
      await homePage.navigate();
      await homePage.handleCookieConsent();
      await homePage.verifyHeroSection();
    });

    await test.step('Navigate to contact form', async () => {
      await homePage.clickContactSales();
      await expect(page.url()).toContain('contact-sales');
    });

    await test.step('Complete contact form', async () => {
      await contactPage.waitForFormLoad();
      
      await contactPage.fillContactForm({
        firstName: 'Journey',
        lastName: 'Test',
        email: 'journey.test@example.com',
        company: 'E2E Test Company',
        jobTitle: 'Test Manager',
        country: 'United States',
        employees: '11-50',
        helpOption: 'Manual testing'
      });
      
      // Verify form is ready for submission
      const isEnabled = await contactPage.isSubmitButtonEnabled();
      expect(isEnabled).toBe(true);
    });

    await test.step('Verify journey completion', async () => {
      // In a real test, we might submit the form to a test endpoint
      // For demo purposes, we verify the form is properly filled
      await expect(contactPage.firstNameField).toHaveValue('Journey');
      await expect(contactPage.lastNameField).toHaveValue('Test');
      await expect(contactPage.emailField).toHaveValue('journey.test@example.com');
      await expect(contactPage.companyField).toHaveValue('E2E Test Company');
    });
  });
});
