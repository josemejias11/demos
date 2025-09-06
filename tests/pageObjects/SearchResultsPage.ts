import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class SearchResultsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Search results container
  get resultsContainer() {
    return this.page.locator('[data-testid="search-results"], .search-results, .hotel-listings');
  }

  get resultsCount() {
    return this.page.locator('[data-testid="results-count"], .results-count');
  }

  get noResultsMessage() {
    return this.page.locator('[data-testid="no-results"], .no-results');
  }

  // Hotel cards
  get hotelCards() {
    return this.page.locator('[data-testid="hotel-card"], .hotel-card, .listing-card');
  }

  get firstHotelCard() {
    return this.hotelCards.first();
  }

  // Filters and sorting
  get filtersPanel() {
    return this.page.locator('[data-testid="filters"], .filters-panel, .sidebar');
  }

  get filtersToggle() {
    return this.page.getByRole('button', { name: /filter|filters/i });
  }

  get sortDropdown() {
    return this.page.locator('[data-testid="sort"], select[name="sort"], .sort-dropdown');
  }

  get priceFilter() {
    return this.page.locator('[data-testid="price-filter"], .price-filter');
  }

  get ratingFilter() {
    return this.page.locator('[data-testid="rating-filter"], .rating-filter');
  }

  get amenityFilters() {
    return this.page.locator('[data-testid="amenity-filters"], .amenity-filters');
  }

  get clearFiltersButton() {
    return this.page.getByRole('button', { name: /clear|reset.*filter/i });
  }

  // Pagination
  get pagination() {
    return this.page.locator('[data-testid="pagination"], .pagination');
  }

  get nextPageButton() {
    return this.page.getByRole('button', { name: /next/i });
  }

  get previousPageButton() {
    return this.page.getByRole('button', { name: /previous|prev/i });
  }

  get pageNumbers() {
    return this.pagination.locator('a, button').filter({ hasText: /^\d+$/ });
  }

  // Map view
  get mapToggle() {
    return this.page.getByRole('button', { name: /map/i });
  }

  get mapContainer() {
    return this.page.locator('[data-testid="map"], .map-container, #map');
  }

  // Hotel card elements
  hotelCardByName(hotelName: string) {
    return this.hotelCards.filter({ hasText: hotelName });
  }

  getHotelCardElements(hotelCard: Locator) {
    return {
      name: hotelCard.locator('[data-testid="hotel-name"], .hotel-name, h2, h3'),
      image: hotelCard.locator('[data-testid="hotel-image"], .hotel-image, img'),
      rating: hotelCard.locator('[data-testid="rating"], .rating, .stars'),
      price: hotelCard.locator('[data-testid="price"], .price'),
      originalPrice: hotelCard.locator('[data-testid="original-price"], .original-price, .strike-through'),
      discount: hotelCard.locator('[data-testid="discount"], .discount, .save'),
      availability: hotelCard.locator('[data-testid="availability"], .availability'),
      amenities: hotelCard.locator('[data-testid="amenities"], .amenities'),
      viewButton: hotelCard.getByRole('button', { name: /view|details|see more/i }),
      bookButton: hotelCard.getByRole('button', { name: /book|select/i })
    };
  }

  // Actions
  async waitForResults() {
    // Wait for either results to load or no results message
    await Promise.race([
      this.resultsContainer.waitFor({ state: 'visible' }),
      this.noResultsMessage.waitFor({ state: 'visible' })
    ]);
    await this.waitForPageLoad();
  }

  async getResultsCount(): Promise<number> {
    if (await this.noResultsMessage.isVisible()) {
      return 0;
    }
    
    const count = await this.hotelCards.count();
    return count;
  }

  async getHotelNames(): Promise<string[]> {
    const names: string[] = [];
    const cards = await this.hotelCards.all();
    
    for (const card of cards) {
      const nameElement = this.getHotelCardElements(card).name;
      const name = await nameElement.textContent();
      if (name) {
        names.push(name.trim());
      }
    }
    
    return names;
  }

  async clickHotelByName(hotelName: string) {
    const hotelCard = this.hotelCardByName(hotelName);
    await this.expectElementVisible(hotelCard);
    
    const cardElements = this.getHotelCardElements(hotelCard);
    
    // Try clicking the view/details button first, then the card itself
    if (await cardElements.viewButton.isVisible()) {
      await cardElements.viewButton.click();
    } else {
      await hotelCard.click();
    }
    
    // Wait for navigation to hotel details page
    await this.page.waitForURL(/.*\/hotel.*|.*\/property.*/);
    await this.waitForPageLoad();
  }

  async clickFirstHotel() {
    await this.expectElementVisible(this.firstHotelCard);
    const cardElements = this.getHotelCardElements(this.firstHotelCard);
    
    if (await cardElements.viewButton.isVisible()) {
      await cardElements.viewButton.click();
    } else {
      await this.firstHotelCard.click();
    }
    
    await this.page.waitForURL(/.*\/hotel.*|.*\/property.*/);
    await this.waitForPageLoad();
  }

  async applyPriceFilter(minPrice?: number, maxPrice?: number) {
    await this.openFiltersPanel();
    
    const priceMin = this.priceFilter.locator('[data-testid="price-min"], [name="price-min"], input[type="number"]').first();
    const priceMax = this.priceFilter.locator('[data-testid="price-max"], [name="price-max"], input[type="number"]').last();
    
    if (minPrice !== undefined && await priceMin.isVisible()) {
      await priceMin.fill(minPrice.toString());
    }
    
    if (maxPrice !== undefined && await priceMax.isVisible()) {
      await priceMax.fill(maxPrice.toString());
    }
    
    // Apply filter
    const applyButton = this.priceFilter.getByRole('button', { name: /apply/i });
    if (await applyButton.isVisible()) {
      await applyButton.click();
    }
    
    await this.waitForResults();
  }

  async applyRatingFilter(minRating: number) {
    await this.openFiltersPanel();
    
    const ratingOption = this.ratingFilter.locator(`[data-rating="${minRating}"], [value="${minRating}"]`);
    if (await ratingOption.isVisible()) {
      await ratingOption.click();
    } else {
      // Fallback: click on star rating
      const starRating = this.ratingFilter.locator('.star, .rating').nth(minRating - 1);
      if (await starRating.isVisible()) {
        await starRating.click();
      }
    }
    
    await this.waitForResults();
  }

  async sortResults(sortOption: 'price-low' | 'price-high' | 'rating' | 'distance') {
    if (await this.sortDropdown.isVisible()) {
      await this.sortDropdown.selectOption(sortOption);
    } else {
      // Look for sort buttons instead of dropdown
      const sortButton = this.page.getByRole('button', { name: new RegExp(sortOption.replace('-', ' '), 'i') });
      if (await sortButton.isVisible()) {
        await sortButton.click();
      }
    }
    
    await this.waitForResults();
  }

  async openFiltersPanel() {
    if (await this.filtersToggle.isVisible() && !await this.filtersPanel.isVisible()) {
      await this.filtersToggle.click();
      await this.filtersPanel.waitFor({ state: 'visible' });
    }
  }

  async clearAllFilters() {
    if (await this.clearFiltersButton.isVisible()) {
      await this.clearFiltersButton.click();
      await this.waitForResults();
    }
  }

  async goToPage(pageNumber: number) {
    const pageButton = this.pageNumbers.filter({ hasText: pageNumber.toString() });
    if (await pageButton.isVisible()) {
      await pageButton.click();
      await this.waitForResults();
    }
  }

  async goToNextPage() {
    if (await this.nextPageButton.isVisible()) {
      await this.nextPageButton.click();
      await this.waitForResults();
    }
  }

  async toggleMapView() {
    if (await this.mapToggle.isVisible()) {
      await this.mapToggle.click();
      await this.mapContainer.waitFor({ state: 'visible' });
    }
  }

  // Validation methods
  async validateSearchResults() {
    await this.expectElementVisible(this.resultsContainer);
    
    const count = await this.getResultsCount();
    if (count > 0) {
      await this.expectElementVisible(this.firstHotelCard);
      
      // Validate first hotel card has required elements
      const cardElements = this.getHotelCardElements(this.firstHotelCard);
      await this.expectElementVisible(cardElements.name);
      await this.expectElementVisible(cardElements.price);
    }
  }

  async validateHotelCard(hotelCard: Locator) {
    const elements = this.getHotelCardElements(hotelCard);
    
    await this.expectElementVisible(elements.name);
    await this.expectElementVisible(elements.image);
    await this.expectElementVisible(elements.price);
    
    // Validate price format
    const priceText = await elements.price.textContent();
    expect(priceText).toMatch(/\$\d+/);
    
    // Check if rating is present (not all hotels may have ratings)
    if (await elements.rating.isVisible()) {
      const ratingText = await elements.rating.textContent();
      // Rating should be between 0-5
      expect(ratingText).toMatch(/[0-5]\.?\d*/);
    }
  }

  async validatePriceRange(minPrice: number, maxPrice: number) {
    const hotelCards = await this.hotelCards.all();
    
    for (const card of hotelCards) {
      const priceElement = this.getHotelCardElements(card).price;
      const priceText = await priceElement.textContent();
      
      if (priceText) {
        const price = parseInt(priceText.replace(/[^\d]/g, ''));
        expect(price).toBeGreaterThanOrEqual(minPrice);
        expect(price).toBeLessThanOrEqual(maxPrice);
      }
    }
  }

  async validateSortOrder(sortType: 'price-asc' | 'price-desc' | 'rating-desc') {
    const hotelCards = await this.hotelCards.all();
    const values: number[] = [];
    
    for (const card of hotelCards) {
      const elements = this.getHotelCardElements(card);
      
      if (sortType.startsWith('price')) {
        const priceText = await elements.price.textContent();
        if (priceText) {
          values.push(parseInt(priceText.replace(/[^\d]/g, '')));
        }
      } else if (sortType.startsWith('rating')) {
        const ratingText = await elements.rating.textContent();
        if (ratingText) {
          values.push(parseFloat(ratingText));
        }
      }
    }
    
    // Validate sort order
    for (let i = 1; i < values.length; i++) {
      if (sortType.endsWith('asc')) {
        expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
      } else if (sortType.endsWith('desc')) {
        expect(values[i]).toBeLessThanOrEqual(values[i - 1]);
      }
    }
  }
}
