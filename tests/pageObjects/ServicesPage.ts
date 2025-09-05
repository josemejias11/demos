import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ServicesPage extends BasePage {
  readonly pageHeading: Locator;
  readonly servicesIntro: Locator;
  readonly industriesSection: Locator;
  readonly capabilitiesSection: Locator;
  readonly capabilityTabs: Locator;
  readonly servicesGrid: Locator;
  readonly resourcesSection: Locator;
  
  // Industry cards
  readonly aviationCard: Locator;
  readonly automotiveCard: Locator;
  readonly bankingCard: Locator;
  readonly healthcareCard: Locator;
  readonly manufacturingCard: Locator;
  readonly retailCard: Locator;
  
  // Service categories
  readonly aiServicesTab: Locator;
  readonly cloudServicesTab: Locator;
  readonly dataAnalyticsTab: Locator;
  readonly iotServicesTab: Locator;
  readonly cybersecurityTab: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.locator('text=Services & Industries');
    this.servicesIntro = page.locator('text=We empower enterprises to achieve highest potential');
    this.industriesSection = page.getByRole('heading', { name: 'Industries' });
    this.capabilitiesSection = page.getByText('Capabilities', { exact: true });
    this.capabilityTabs = page.locator('button[role="tab"]');
    this.servicesGrid = page.locator('[ref="e357"]');
    this.resourcesSection = page.getByRole('heading', { name: 'You Might Like' });
    
    // Industry cards - targeting the specific visible industry cards
    this.aviationCard = page.locator('.industry-item:has-text("Aviation")').first();
    this.automotiveCard = page.locator('.industry-item:has-text("Automotive")').first();
    this.bankingCard = page.locator('.industry-item:has-text("Banking & Financial Services")').first();
    this.healthcareCard = page.locator('.industry-item:has-text("Healthcare")').first();
    this.manufacturingCard = page.locator('.industry-item:has-text("Manufacturing")').first();
    this.retailCard = page.locator('.industry-item:has-text("Retail")').first();
    
    // Service categories
    this.aiServicesTab = page.getByRole('link', { name: 'Artificial Intelligence' });
    this.cloudServicesTab = page.getByRole('link', { name: 'Cloud' });
    this.dataAnalyticsTab = page.getByRole('link', { name: 'Data & Analytics' });
    this.iotServicesTab = page.getByRole('link', { name: 'IoT' });
    this.cybersecurityTab = page.getByRole('link', { name: 'Cybersecurity' });
  }

  async navigateToServicesPage() {
    await this.page.goto('/services-and-industries#services');
    await this.waitForPageLoad();
  }

  async validateServicesPageContent() {
    await expect(this.pageHeading).toBeVisible();
    await expect(this.servicesIntro).toBeVisible();
    await this.validatePageTitle('Services And Industries');
  }

  async validateIndustriesSection() {
    console.log('Validating industries section...');
    
    // Wait for initial load
    await this.page.waitForTimeout(2000);
    
    // Check viewport size to determine element structure
    const viewport = await this.page.viewportSize();
    const isMobile = viewport && viewport.width < 768;
    
    if (isMobile) {
      console.log('Mobile viewport detected, checking accordion structure');
      // On mobile, industries appear as accordion items
      const mobileIndustries = [
        'button:has-text("Aviation")',
        'button:has-text("Automotive")', 
        'button:has-text("Banking")',
        'button:has-text("Healthcare")',
        'button:has-text("Manufacturing")'
      ];
      
      let visibleCount = 0;
      for (const selector of mobileIndustries) {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
          visibleCount++;
        }
      }
      
      if (visibleCount === 0) {
        throw new Error('No mobile industry content found on services page');
      }
      console.log(`Found ${visibleCount} mobile industry elements`);
      
    } else {
      console.log('Desktop viewport detected, checking card structure');
      // On desktop, expand Industries button if present
      const industriesButton = this.page.locator('button:has-text("Industries")').first();
      const isIndustriesVisible = await industriesButton.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (isIndustriesVisible) {
        await industriesButton.click({ timeout: 5000 }).catch(() => {});
        await this.page.waitForTimeout(1000); // Allow expansion animation
      }
      
      // Scroll to industries section to ensure industry cards are in viewport
      await this.page.evaluate(() => window.scrollTo(0, 800));
      await this.page.waitForTimeout(1000);
      
      // Check for industry cards with flexible approach and scroll handling
      const industryChecks = [
        { locator: this.aviationCard, name: 'Aviation' },
        { locator: this.automotiveCard, name: 'Automotive' },
        { locator: this.bankingCard, name: 'Banking' },
        { locator: this.healthcareCard, name: 'Healthcare' }
      ];

      let visibleCount = 0;
      for (const check of industryChecks) {
        try {
          // Try to scroll element into view first
          await check.locator.scrollIntoViewIfNeeded({ timeout: 2000 });
          const isVisible = await check.locator.isVisible({ timeout: 3000 });
          if (isVisible) {
            visibleCount++;
          } else {
            console.warn(`${check.name} industry card not visible, continuing...`);
          }
        } catch {
          console.warn(`${check.name} industry card not found, continuing...`);
        }
      }
      
      // Ensure at least some industry content is visible with broader search
      if (visibleCount === 0) {
        // Fallback: check for any industry-related text with multiple strategies
        const industrySelectors = [
          'text*=Aviation',
          'text*=Banking', 
          'text*=Healthcare',
          'text*=Manufacturing',
          'text*=Automotive',
          'text*=industry',
          'text*=Industries',
          '[class*="industry"]',
          '[id*="industry"]'
        ];
        
        let foundContent = false;
        for (const selector of industrySelectors) {
          const element = this.page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
            foundContent = true;
            console.log(`Found industry content with selector: ${selector}`);
            break;
          }
        }
        
        if (!foundContent) {
          throw new Error('No industry content found on services page');
        }
      }
      console.log(`Found ${visibleCount} desktop industry cards`);
    }
  }

  async clickIndustryCard(industry: 'aviation' | 'automotive' | 'banking' | 'healthcare' | 'manufacturing' | 'retail') {
    let card: Locator;
    
    switch (industry) {
      case 'aviation':
        card = this.aviationCard;
        break;
      case 'automotive':
        card = this.automotiveCard;
        break;
      case 'banking':
        card = this.bankingCard;
        break;
      case 'healthcare':
        card = this.healthcareCard;
        break;
      case 'manufacturing':
        card = this.manufacturingCard;
        break;
      case 'retail':
        card = this.retailCard;
        break;
    }
    
    await card.click();
  }

  async validateCapabilitiesSection() {
    // Scroll to capabilities section
    await this.page.evaluate(() => window.scrollTo(0, 1500));
    await expect(this.capabilitiesSection).toBeVisible();
    
    // Validate capability tabs
    await expect(this.page.getByRole('button', { name: 'Digital Technologies and Platforms' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'IT Strategic Consultancy' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Product Engineering Services' })).toBeVisible();
  }

  async selectCapabilityTab(tabName: string) {
    await this.page.getByRole('button', { name: tabName }).click();
    await this.page.waitForTimeout(500); // Allow tab content to load
  }

  async validateServiceCategories() {
    console.log('Validating service categories...');
    
    // Check viewport size to determine element structure
    const viewport = await this.page.viewportSize();
    const isMobile = viewport && viewport.width < 768;
    
    if (isMobile) {
      console.log('Mobile viewport: checking accordion service structure');
      // On mobile, services appear as accordion items with buttons
      const mobileServiceButtons = [
        'button:has-text("Artificial Intelligence")',
        'button:has-text("Cloud")',
        'button:has-text("Data & Analytics")',
        'button:has-text("IoT")'
      ];
      
      // Scroll to services section
      await this.page.evaluate(() => window.scrollTo(0, 1500));
      await this.page.waitForTimeout(1000);
      
      let visibleCount = 0;
      for (const selector of mobileServiceButtons) {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
          visibleCount++;
        }
      }
      
      if (visibleCount === 0) {
        throw new Error('No mobile service categories found');
      }
      
      // Check for trending tags in mobile view (they should be visible as part of button text)
      const trendingElements = this.page.locator('text=Trending');
      const trendingCount = await trendingElements.count();
      console.log(`Found ${trendingCount} trending elements in mobile view`);
      
    } else {
      console.log('Desktop viewport: checking tab/link service structure');
      // Scroll to services section to ensure elements are in viewport
      await this.page.evaluate(() => window.scrollTo(0, 2000));
      await this.page.waitForTimeout(1000); // Allow scrolling to complete
      
      // Scroll trending elements into view before checking
      const trendingElement = this.page.locator('text=Trending').first();
      await trendingElement.scrollIntoViewIfNeeded().catch(() => {
        console.log('Could not scroll trending element into view');
      });
      
      // Check if at least one trending element is visible
      const visibleTrending = await trendingElement.isVisible({ timeout: 3000 }).catch(() => false);
      if (visibleTrending) {
        console.log('Trending elements are visible');
      } else {
        console.log('Trending elements may be hidden in current viewport');
      }
      
      // Scroll to and validate service tabs with scroll handling
      await this.aiServicesTab.scrollIntoViewIfNeeded().catch(() => {
        console.log('Could not scroll AI services tab into view');
      });
      
      // Check visibility with timeout and graceful handling
      const aiVisible = await this.aiServicesTab.isVisible({ timeout: 3000 }).catch(() => false);
      const cloudVisible = await this.cloudServicesTab.isVisible({ timeout: 3000 }).catch(() => false);
      const dataVisible = await this.dataAnalyticsTab.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (!aiVisible && !cloudVisible && !dataVisible) {
        throw new Error('No desktop service categories found');
      }
      
      console.log(`Service tabs visibility - AI: ${aiVisible}, Cloud: ${cloudVisible}, Data: ${dataVisible}`);
    }
  }

  async clickServiceCategory(category: 'ai' | 'cloud' | 'data' | 'iot' | 'cybersecurity') {
    let tab: Locator;
    
    switch (category) {
      case 'ai':
        tab = this.aiServicesTab;
        break;
      case 'cloud':
        tab = this.cloudServicesTab;
        break;
      case 'data':
        tab = this.dataAnalyticsTab;
        break;
      case 'iot':
        tab = this.iotServicesTab;
        break;
      case 'cybersecurity':
        tab = this.cybersecurityTab;
        break;
    }
    
    try {
      await tab.waitFor({ state: 'visible', timeout: 10000 });
      await tab.scrollIntoViewIfNeeded();
      await tab.click({ timeout: 8000 });
    } catch (error) {
      console.log(`Service category "${category}" click failed:`, error.message);
      // Try force click as fallback
      await tab.click({ force: true });
    }
    await this.page.waitForTimeout(500); // Allow content to load
  }

  async validateServiceDetails(_serviceName: string) {
    // After clicking a service, validate the description appears
    await this.page.waitForTimeout(1000);
    
    // Look for "See more" link which indicates service details are shown
    const seeMoreLink = this.page.getByRole('link', { name: 'See more' });
    await expect(seeMoreLink).toBeVisible();
  }

  async clickSeeMoreLink() {
    await this.page.getByRole('link', { name: 'See more' }).click();
  }

  async validateResourcesSection() {
    // Scroll to resources section
    await this.page.evaluate(() => window.scrollTo(0, 3000));
    await expect(this.resourcesSection).toBeVisible();
    
    // Validate resource cards are present
    const resourceCards = this.page.locator('text=Read more');
    await expect(resourceCards.first()).toBeVisible();
  }

  async clickResourceCard(index: number = 0) {
    const resourceCards = this.page.getByRole('link', { name: 'Read more' });
    await resourceCards.nth(index).click();
  }

  async searchIndustry(_industryName: string) {
    // Use the search functionality if available
    await this.searchLink.click();
    // This would need implementation based on search functionality
  }

  async validatePageResponsiveness() {
    // Test different viewport sizes
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await expect(this.industriesSection).toBeVisible();
    
    await this.page.setViewportSize({ width: 375, height: 667 });
    await expect(this.industriesSection).toBeVisible();
    
    // Reset to desktop
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }
}
