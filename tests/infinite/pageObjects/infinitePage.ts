import { expect } from '@playwright/test';
import { BasePage } from './basePage';
import { LocatorIntent } from '../../../automation/locators/resolver/intentTypes';
import { infiniteSelectors, performanceThresholds, siteConfig } from '../infinite.config';

export class InfinitePage extends BasePage {
  
  async waitForCriticalContent() {
    // Wait for hero section to be visible
    const heroIntent: LocatorIntent = {
      target: 'hero-section',
      synonyms: ['main banner', 'hero banner', 'primary content'],
      roleHint: 'region'
    };

    try {
      const heroElement = await this.findElement(heroIntent);
      await expect(heroElement).toBeVisible();
      
      await this.recordTelemetry('content.hero_loaded', {
        element: 'hero-section'
      });
    } catch {
      // Fallback to hardcoded selector
      await expect(this.page.locator(infiniteSelectors.heroSection).first()).toBeVisible();
    }

    // Verify main navigation is present
    await this.waitForNavigation();
  }

  async waitForNavigation() {
    const navIntent: LocatorIntent = {
      target: 'main-navigation',
      synonyms: ['primary navigation', 'main menu', 'header navigation'],
      roleHint: 'navigation'
    };

    try {
      const navElement = await this.findElement(navIntent);
      await expect(navElement).toBeVisible();
    } catch {
      // Fallback to site config selector
      await expect(this.page.locator(siteConfig.selectors.navigationMenu || 'nav').first()).toBeVisible();
    }
  }

  async navigateToSolutions(): Promise<void> {
    try {
      // First, hover over Solutions to trigger the dropdown
      await this.page.getByText('Solutions').nth(0).hover();
      
      // Wait a moment for the dropdown to appear
      await this.page.waitForTimeout(500);
      
      // Record telemetry
      await this.recordTelemetry('action.solutions_menu_accessed', {});
    } catch (error) {
      await this.recordTelemetry('action.solutions_menu_failed', { error: String(error) });
      throw error;
    }
  }

  async verifySolutionsDropdown() {
    const dropdownOptions = [
      { target: 'brassring-solution', synonyms: ['BrassRing', 'Talent Management'] },
      { target: 'small-business-solution', synonyms: ['Small Business', 'SMB Solutions'] },
      { target: 'infinite-convergence-solution', synonyms: ['Infinite Convergence', 'Convergence'] },
      { target: 'sensyon-solution', synonyms: ['Sensyon', 'AI Platform'] }
    ];

    for (const option of dropdownOptions) {
      const intent: LocatorIntent = {
        target: option.target,
        synonyms: option.synonyms,
        roleHint: 'link'
      };

      try {
        const element = await this.findElement(intent);
        await expect(element).toBeVisible();
        
        await this.recordTelemetry('navigation.dropdown_option_visible', {
          option: option.target
        });
      } catch (error) {
        await this.recordTelemetry('navigation.dropdown_option_missing', {
          option: option.target,
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    }
  }

  async navigateCarousel(direction: 'next' | 'previous' = 'next') {
    try {
      const startTime = Date.now();
      
      // Use the specific button based on direction and context
      const buttonSelector = direction === 'next' 
        ? infiniteSelectors.heroNextButton 
        : infiniteSelectors.heroPrevButton;
      
      const button = this.page.locator(buttonSelector);
      await button.click();
      
      // Wait for carousel transition
      await this.page.waitForTimeout(1000);
      
      const endTime = Date.now();
      const transitionTime = endTime - startTime;
      
      await this.recordTelemetry('performance.carousel_transition', {
        direction,
        transitionTime,
        withinThreshold: transitionTime < performanceThresholds.maxCarouselTransition
      });
    } catch (error) {
      await this.recordTelemetry('action.carousel_navigation_failed', {
        direction,
        error: String(error)
      });
      throw error;
    }
  }

  async verifyIndustryTabs() {
    const industries = [
      'Banking & Financial Services',
      'Healthcare',
      'Manufacturing',
      'Retail',
      'Government',
      'Education',
      'Travel & Hospitality',
      'Telecommunications',
      'Energy & Utilities'
    ];

    for (const industry of industries) {
      const tabIntent: LocatorIntent = {
        target: `${industry.toLowerCase().replace(/\s+/g, '-')}-tab`,
        synonyms: [industry, industry.replace('&', 'and')],
        roleHint: 'tab'
      };

      try {
        const element = await this.findElement(tabIntent);
        await expect(element).toBeVisible();
      } catch {
        // Try text-based selector as fallback
        await expect(this.page.locator(`text="${industry}"`).first()).toBeVisible();
      }
    }

    await this.recordTelemetry('content.industry_tabs_verified', {
      count: industries.length
    });
  }

  async verifyServicesCarousel() {
    try {
      // Look for the services carousel section
      const servicesCarousel = this.page.locator(infiniteSelectors.servicesCarousel);
      await servicesCarousel.waitFor({ timeout: 10000 });
      
      // Count service items/groups
      const serviceGroups = this.page.locator(infiniteSelectors.servicesSlides);
      const count = await serviceGroups.count();
      
      if (count > 0) {
        await this.recordTelemetry('content.services_carousel_verified', {
          serviceCount: count
        });
        return count;
      }
      
      throw new Error('No service items found');
    } catch {
      // Fallback verification
      await expect(this.page.locator(infiniteSelectors.servicesCarousel).first()).toBeVisible();
      return 0;
    }
  }

  async verifyGlobalOffices() {
    const officesIntent: LocatorIntent = {
      target: 'global-offices',
      synonyms: ['offices', 'locations', 'global presence', 'worldwide offices'],
      roleHint: 'region'
    };

    try {
      const officesSection = await this.findElement(officesIntent);
      await expect(officesSection).toBeVisible();

      // Count office locations
      const officeItems = this.page.locator(`${infiniteSelectors.globalOffices} .office, ${infiniteSelectors.globalOffices} .location`);
      const count = await officeItems.count();

      await this.recordTelemetry('content.global_offices_verified', {
        officeCount: count
      });

      return count;
    } catch {
      // Try fallback selectors
      const fallbackSelectors = [
        '.offices', '.locations', '[data-section="offices"]', 
        'text="Global Offices"', 'text="Locations"'
      ];
      
      for (const selector of fallbackSelectors) {
        try {
          await expect(this.page.locator(selector).first()).toBeVisible();
          return 1; // Found at least one office section
        } catch {
          continue;
        }
      }
      
      throw new Error('Global offices section not found');
    }
  }

  async performHealthCheck() {
    const healthChecks = [
      { name: 'hero_content', check: () => this.waitForCriticalContent() },
      { name: 'navigation', check: () => this.waitForNavigation() },
      { name: 'solutions_dropdown', check: () => this.verifySolutionsDropdown() },
      { name: 'industry_tabs', check: () => this.verifyIndustryTabs() },
      { name: 'services_carousel', check: () => this.verifyServicesCarousel() },
      { name: 'global_offices', check: () => this.verifyGlobalOffices() }
    ];

    const results: Record<string, boolean> = {};

    for (const healthCheck of healthChecks) {
      try {
        await healthCheck.check();
        results[healthCheck.name] = true;
      } catch (error) {
        results[healthCheck.name] = false;
        await this.recordTelemetry('health_check.failed', {
          check: healthCheck.name,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    await this.recordTelemetry('health_check.completed', {
      results,
      passedCount: Object.values(results).filter(Boolean).length,
      totalCount: healthChecks.length
    });

    return results;
  }
}