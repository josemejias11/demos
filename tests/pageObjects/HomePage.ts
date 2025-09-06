import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { testData } from '../fixtures/testData';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Search form elements
  get searchLocationInput() {
    return this.page.locator('button:has-text("Where to?"), input[placeholder*="location"], combobox[aria-label*="Where"]');
  }

  get searchButton() {
    return this.page.getByRole('button', { name: /search/i });
  }

  get locationSuggestions() {
    return this.page.locator('[role="listbox"], .autocomplete-results, .suggestions');
  }

  get datePicker() {
    return this.page.locator('[data-testid="date-picker"], .date-picker, input[type="date"]');
  }

  get checkInDate() {
    return this.page.locator('[data-testid="checkin-date"], #checkin, [name="checkin"]');
  }

  get checkOutDate() {
    return this.page.locator('[data-testid="checkout-date"], #checkout, [name="checkout"]');
  }

  // Guest selection
  get guestSelector() {
    return this.page.locator('[data-testid="guest-selector"], .guest-selector');
  }

  get adultsCounter() {
    return this.page.locator('[data-testid="adults-counter"], [data-guest-type="adults"]');
  }

  get childrenCounter() {
    return this.page.locator('[data-testid="children-counter"], [data-guest-type="children"]');
  }

  get infantsCounter() {
    return this.page.locator('[data-testid="infants-counter"], [data-guest-type="infants"]');
  }

  // Hero section
  get heroSection() {
    return this.page.locator('[data-testid="hero"], .hero, .hero-section');
  }

  get heroTitle() {
    return this.page.locator('h1, [data-testid="hero-title"]');
  }

  get heroSubtitle() {
    return this.page.locator('[data-testid="hero-subtitle"], .hero-subtitle');
  }

  // Featured content
  get featuredHotels() {
    return this.page.locator('[data-testid="featured-hotels"], .featured-hotels');
  }

  get popularDestinations() {
    return this.page.locator('[data-testid="popular-destinations"], .popular-destinations');
  }

  get howItWorksSection() {
    return this.page.locator('[data-testid="how-it-works"], .how-it-works');
  }

  // Navigation elements specific to homepage
  get downloadAppSection() {
    return this.page.locator('[data-testid="download-app"], .download-app');
  }

  get appStoreLink() {
    return this.page.locator('[data-testid="app-store"], a[href*="apps.apple.com"]');
  }

  get playStoreLink() {
    return this.page.locator('[data-testid="play-store"], a[href*="play.google.com"]');
  }

  // Actions
  async searchForLocation(location: string) {
    await this.searchLocationInput.fill(location);
    
    // Wait for and select from autocomplete suggestions
    await this.locationSuggestions.waitFor({ state: 'visible' });
    
    // Click on the first suggestion that matches our location
    const suggestion = this.locationSuggestions.locator(`text="${location}"`).first();
    if (await suggestion.isVisible()) {
      await suggestion.click();
    } else {
      // If no exact match, click the first suggestion
      await this.locationSuggestions.locator('li, [role="option"]').first().click();
    }
  }

  async selectDates(checkIn: string, checkOut?: string) {
    // Click date picker to open calendar
    await this.datePicker.click();
    
    // If specific date inputs exist, fill them
    if (await this.checkInDate.isVisible()) {
      await this.checkInDate.fill(checkIn);
      if (checkOut) {
        await this.checkOutDate.fill(checkOut);
      }
    } else {
      // Navigate calendar to select dates
      // This would need to be customized based on the actual calendar implementation
      await this.selectDateFromCalendar(checkIn);
      if (checkOut) {
        await this.selectDateFromCalendar(checkOut);
      }
    }
  }

  private async selectDateFromCalendar(date: string) {
    // Parse date and find corresponding calendar cell
    const dateObj = new Date(date);
    const daySelector = `[data-date="${date}"], [aria-label*="${dateObj.getDate()}"]`;
    
    const dayElement = this.page.locator(daySelector);
    if (await dayElement.isVisible()) {
      await dayElement.click();
    }
  }

  async setGuestCount(adults: number, children: number = 0, infants: number = 0) {
    // Open guest selector if it's a dropdown
    if (await this.guestSelector.isVisible()) {
      await this.guestSelector.click();
    }

    // Set adult count
    await this.setCounterValue(this.adultsCounter, adults);
    
    // Set children count if needed
    if (children > 0) {
      await this.setCounterValue(this.childrenCounter, children);
    }
    
    // Set infants count if needed
    if (infants > 0) {
      await this.setCounterValue(this.infantsCounter, infants);
    }

    // Close guest selector if it was opened
    if (await this.guestSelector.isVisible()) {
      await this.page.keyboard.press('Escape');
    }
  }

  private async setCounterValue(counterElement: Locator, targetCount: number) {
    const plusButton = counterElement.locator('[data-testid="increment"], .increment, button[aria-label*="increase"]');
    const minusButton = counterElement.locator('[data-testid="decrement"], .decrement, button[aria-label*="decrease"]');
    const currentValueElement = counterElement.locator('[data-testid="count"], .count, input[type="number"]');
    
    // Get current value
    let currentValue = 0;
    if (await currentValueElement.isVisible()) {
      const value = await currentValueElement.inputValue();
      currentValue = parseInt(value) || 0;
    }

    // Adjust to target count
    const difference = targetCount - currentValue;
    
    if (difference > 0) {
      // Increase count
      for (let i = 0; i < difference; i++) {
        await plusButton.click();
        await this.page.waitForTimeout(100); // Small delay for UI updates
      }
    } else if (difference < 0) {
      // Decrease count
      for (let i = 0; i < Math.abs(difference); i++) {
        await minusButton.click();
        await this.page.waitForTimeout(100);
      }
    }
  }

  async performSearch(locationName: string, guestConfig?: { adults: number; children?: number; infants?: number }) {
    // Fill location
    await this.searchForLocation(locationName);
    
    // Set guest count if provided
    if (guestConfig) {
      await this.setGuestCount(guestConfig.adults, guestConfig.children, guestConfig.infants);
    }
    
    // Click search button
    await this.searchButton.click();
    
    // Wait for navigation to search results
    await this.page.waitForURL(/.*\/search.*|.*\/results.*/);
    await this.waitForPageLoad();
  }

  async quickSearchMiami() {
    const miamiData = testData.locations.miami;
    await this.performSearch(miamiData.searchTerm, testData.guests.couple);
  }

  async quickSearchOrlando() {
    const orlandoData = testData.locations.orlando;
    await this.performSearch(orlandoData.searchTerm, testData.guests.family);
  }

  // Validation methods
  async validateHomepageElements() {
    await this.expectElementVisible(this.searchLocationInput);
    await this.expectElementVisible(this.searchButton);
    await this.expectElementVisible(this.heroSection);
  }

  async validateSearchFormFunctionality() {
    // Test location autocomplete
    await this.searchLocationInput.fill('Mia');
    await this.expectElementVisible(this.locationSuggestions);
    
    // Test date picker
    await this.datePicker.click();
    // Additional calendar validation would go here
    
    // Test guest selector
    if (await this.guestSelector.isVisible()) {
      await this.guestSelector.click();
      await this.expectElementVisible(this.adultsCounter);
    }
  }
}
