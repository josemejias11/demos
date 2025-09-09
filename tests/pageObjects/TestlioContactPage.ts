import { Page, Locator, FrameLocator } from '@playwright/test';

/**
 * Page Object Model for Testlio Contact Sales page
 * Handles iframe-based HubSpot form interactions
 */
export class TestlioContactPage {
  readonly page: Page;
  readonly frame: FrameLocator;
  
  // Page elements
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;
  readonly testimonialSlider: Locator;

  // Form elements (inside iframe)
  readonly form: Locator;
  readonly firstNameField: Locator;
  readonly lastNameField: Locator;
  readonly emailField: Locator;
  readonly phoneField: Locator;
  readonly companyField: Locator;
  readonly countryDropdown: Locator;
  readonly employeesDropdown: Locator;
  readonly jobTitleField: Locator;
  readonly helpDropdown: Locator;
  readonly submitButton: Locator;

  // Links
  readonly termsLink: Locator;
  readonly privacyLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.frame = page.frameLocator('iframe');
    
    // Page elements
    this.pageTitle = page.getByRole('heading', { name: /talk to an expert/i });
    this.pageDescription = page.locator('text=Tell us a little about your needs');
    this.testimonialSlider = page.locator('section').filter({ hasText: /because of how flexible testlio/i });

    // Form elements (inside iframe)
    this.form = this.frame.getByRole('form', { name: 'HubSpot Form' });
    this.firstNameField = this.frame.getByRole('textbox', { name: /first name/i });
    this.lastNameField = this.frame.getByRole('textbox', { name: /last name/i });
    this.emailField = this.frame.getByRole('textbox', { name: /email/i });
    this.phoneField = this.frame.getByRole('textbox', { name: /phone/i });
    this.companyField = this.frame.getByRole('textbox', { name: /company/i });
    this.countryDropdown = this.frame.getByRole('button', { name: /country/i });
    this.employeesDropdown = this.frame.getByRole('button', { name: /# of employees/i });
    this.jobTitleField = this.frame.getByRole('textbox', { name: /job title/i });
    this.helpDropdown = this.frame.getByRole('button', { name: /how can we help/i });
    this.submitButton = this.frame.getByRole('button', { name: /submit/i });

    // Links
    this.termsLink = this.frame.getByRole('link', { name: /terms and conditions/i });
    this.privacyLink = this.frame.getByRole('link', { name: /privacy policy/i });
  }

  async navigate() {
    await this.page.goto('https://testlio.com/contact-sales/');
  }

  async waitForFormLoad() {
    await this.form.waitFor({ timeout: 15000 });
  }

  async fillContactForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    phone?: string;
    jobTitle?: string;
    country?: string;
    employees?: string;
    helpOption?: string;
  }) {
    // Fill required fields
    await this.firstNameField.fill(data.firstName);
    await this.lastNameField.fill(data.lastName);
    await this.emailField.fill(data.email);
    await this.companyField.fill(data.company);

    // Fill optional fields
    if (data.phone) {
      await this.phoneField.fill(data.phone);
    }
    
    if (data.jobTitle) {
      await this.jobTitleField.fill(data.jobTitle);
    }

    // Handle dropdown selections
    if (data.country) {
      await this.countryDropdown.click();
      // Use exact matching to avoid ambiguity with multiple country options
      await this.frame.getByRole('option', { name: data.country, exact: true }).click();
    }

    if (data.employees) {
      await this.employeesDropdown.click();
      await this.frame.getByText(data.employees).click();
    }

    if (data.helpOption) {
      await this.helpDropdown.click();
      await this.frame.getByText(data.helpOption).click();
    }
  }

  async submitForm() {
    await this.submitButton.click();
  }

  async verifyRequiredFields() {
    await this.firstNameField.waitFor();
    await this.lastNameField.waitFor();
    await this.emailField.waitFor();
    await this.companyField.waitFor();
    await this.countryDropdown.waitFor();
    await this.employeesDropdown.waitFor();
    await this.helpDropdown.waitFor();
  }

  async getFormFieldLabels(): Promise<string[]> {
    const labels = await this.frame.locator('label, [role="label"]').allTextContents();
    return labels.filter(label => label.trim().length > 0);
  }

  async isSubmitButtonEnabled(): Promise<boolean> {
    return await this.submitButton.isEnabled();
  }

  async validateEmail(email: string): Promise<boolean> {
    await this.emailField.fill(email);
    await this.emailField.blur();
    
    // Check for validation error styling or messages
    const hasError = await this.frame.locator('.error, [aria-invalid="true"]').isVisible();
    return !hasError;
  }
}
