import { test, expect } from '@playwright/test';
import { HomePage } from './pageObjects/HomePage';
import { SearchResultsPage } from './pageObjects/SearchResultsPage';
import { testData } from './fixtures/testData';

test.describe('ResortPass Search Functionality', () => {
  let homePage: HomePage;
  let searchResultsPage: SearchResultsPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    searchResultsPage = new SearchResultsPage(page);
    
    await homePage.goto();
    await homePage.dismissCookieBanner();
    await homePage.closeModal(); // Close any welcome modals
  });

  test.describe('Homepage Search Form', () => {
    test('should display search form with all required elements @smoke', async () => {
      await homePage.validateHomepageElements();
      await homePage.validateSearchFormFunctionality();
    });

    test('should show location autocomplete suggestions', async ({ page }) => {
      await homePage.searchLocationInput.fill('Mia');
      await homePage.expectElementVisible(homePage.locationSuggestions);
      
      // Verify suggestions contain Miami
      const suggestions = await homePage.locationSuggestions.textContent();
      expect(suggestions).toContain('Miami');
    });

    test('should validate date picker functionality', async ({ page }) => {
      await homePage.datePicker.click();
      
      // Verify calendar appears or date input is functional
      const hasCalendar = await page.locator('.calendar, [role="dialog"]').isVisible();
      const hasDateInput = await homePage.checkInDate.isVisible();
      
      expect(hasCalendar || hasDateInput).toBeTruthy();
    });
  });

  test.describe('Search Results', () => {
    test('should return results for Miami search @smoke', async ({ page }) => {
      const miamiData = testData.locations.miami;
      
      await homePage.performSearch(miamiData.searchTerm, testData.guests.couple);
      await searchResultsPage.waitForResults();
      
      // Validate results page loaded
      await searchResultsPage.validateSearchResults();
      
      // Verify minimum number of results
      const resultsCount = await searchResultsPage.getResultsCount();
      expect(resultsCount).toBeGreaterThanOrEqual(miamiData.minExpectedResults);
      
      // Verify some expected hotels are present
      const hotelNames = await searchResultsPage.getHotelNames();
      const hasExpectedHotels = miamiData.expectedHotels.some(hotel => 
        hotelNames.some(name => name.includes(hotel))
      );
      expect(hasExpectedHotels).toBeTruthy();
    });

    test('should return results for Orlando search', async ({ page }) => {
      const orlandoData = testData.locations.orlando;
      
      await homePage.performSearch(orlandoData.searchTerm, testData.guests.family);
      await searchResultsPage.waitForResults();
      
      const resultsCount = await searchResultsPage.getResultsCount();
      expect(resultsCount).toBeGreaterThanOrEqual(orlandoData.minExpectedResults);
    });

    test('should return results for Las Vegas search', async ({ page }) => {
      const vegasData = testData.locations.lasVegas;
      
      await homePage.performSearch(vegasData.searchTerm, testData.guests.group);
      await searchResultsPage.waitForResults();
      
      const resultsCount = await searchResultsPage.getResultsCount();
      expect(resultsCount).toBeGreaterThanOrEqual(vegasData.minExpectedResults);
    });

    test('should validate all hotel cards have required information', async ({ page }) => {
      await homePage.quickSearchMiami();
      await searchResultsPage.waitForResults();
      
      const hotelCards = await searchResultsPage.hotelCards.all();
      expect(hotelCards.length).toBeGreaterThan(0);
      
      // Validate first few hotel cards
      for (let i = 0; i < Math.min(5, hotelCards.length); i++) {
        await searchResultsPage.validateHotelCard(hotelCards[i]);
      }
    });
  });

  test.describe('Search Filters and Sorting', () => {
    test.beforeEach(async ({ page }) => {
      await homePage.quickSearchMiami();
      await searchResultsPage.waitForResults();
    });

    test('should filter results by price range', async ({ page }) => {
      const minPrice = 50;
      const maxPrice = 200;
      
      await searchResultsPage.applyPriceFilter(minPrice, maxPrice);
      await searchResultsPage.validatePriceRange(minPrice, maxPrice);
    });

    test('should filter results by rating', async ({ page }) => {
      await searchResultsPage.applyRatingFilter(4);
      
      // Verify only 4+ star hotels are shown
      const hotelCards = await searchResultsPage.hotelCards.all();
      
      for (const card of hotelCards) {
        const elements = searchResultsPage.getHotelCardElements(card);
        if (await elements.rating.isVisible()) {
          const ratingText = await elements.rating.textContent();
          const rating = parseFloat(ratingText || '0');
          expect(rating).toBeGreaterThanOrEqual(4);
        }
      }
    });

    test('should sort results by price low to high', async ({ page }) => {
      await searchResultsPage.sortResults('price-low');
      await searchResultsPage.validateSortOrder('price-asc');
    });

    test('should sort results by price high to low', async ({ page }) => {
      await searchResultsPage.sortResults('price-high');
      await searchResultsPage.validateSortOrder('price-desc');
    });

    test('should clear all filters', async ({ page }) => {
      // Apply some filters
      await searchResultsPage.applyPriceFilter(100, 300);
      await searchResultsPage.applyRatingFilter(4);
      
      const filteredCount = await searchResultsPage.getResultsCount();
      
      // Clear filters
      await searchResultsPage.clearAllFilters();
      
      const unfilteredCount = await searchResultsPage.getResultsCount();
      expect(unfilteredCount).toBeGreaterThanOrEqual(filteredCount);
    });
  });

  test.describe('Search Edge Cases', () => {
    test('should handle invalid location search', async ({ page }) => {
      await homePage.searchLocationInput.fill('InvalidLocationXYZ123');
      await homePage.searchButton.click();
      
      // Should either show no results or return to search form
      const hasNoResults = await searchResultsPage.noResultsMessage.isVisible();
      const backToSearch = await homePage.searchLocationInput.isVisible();
      
      expect(hasNoResults || backToSearch).toBeTruthy();
    });

    test('should handle search with past dates', async ({ page }) => {
      await homePage.searchLocationInput.fill('Miami');
      
      // Try to set a past date
      const pastDate = '2023-01-01';
      if (await homePage.checkInDate.isVisible()) {
        await homePage.checkInDate.fill(pastDate);
        await homePage.searchButton.click();
        
        // Should either prevent search or show error
        const hasError = await homePage.errorMessage.isVisible();
        const stillOnHomepage = await homePage.searchLocationInput.isVisible();
        
        expect(hasError || stillOnHomepage).toBeTruthy();
      }
    });

    test('should handle empty search submission', async ({ page }) => {
      await homePage.searchButton.click();
      
      // Should remain on homepage or show validation error
      const hasError = await homePage.errorMessage.isVisible();
      const stillOnHomepage = await homePage.searchLocationInput.isVisible();
      
      expect(hasError || stillOnHomepage).toBeTruthy();
    });
  });

  test.describe('Pagination', () => {
    test('should navigate between result pages', async ({ page }) => {
      await homePage.quickSearchMiami();
      await searchResultsPage.waitForResults();
      
      // Check if pagination exists
      if (await searchResultsPage.pagination.isVisible()) {
        const initialHotels = await searchResultsPage.getHotelNames();
        
        // Go to next page
        await searchResultsPage.goToNextPage();
        
        const nextPageHotels = await searchResultsPage.getHotelNames();
        
        // Verify different hotels are shown
        expect(nextPageHotels).not.toEqual(initialHotels);
      }
    });
  });

  test.describe('Mobile Responsive Search', () => {
    test('should work on mobile viewport @mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await homePage.goto();
      await homePage.dismissCookieBanner();
      await homePage.closeModal();
      
      // Validate mobile search functionality
      await homePage.validateHomepageElements();
      await homePage.quickSearchMiami();
      await searchResultsPage.waitForResults();
      await searchResultsPage.validateSearchResults();
    });
  });
});
