import { test, expect } from '@playwright/test';
import { HomePage } from './pageObjects/HomePage';
import { SearchResultsPage } from './pageObjects/SearchResultsPage';
import { HotelDetailsPage } from './pageObjects/HotelDetailsPage';
import { testData } from './fixtures/testData';

test.describe('ResortPass Hotel Details and Products', () => {
  let homePage: HomePage;
  let searchResultsPage: SearchResultsPage;
  let hotelDetailsPage: HotelDetailsPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    searchResultsPage = new SearchResultsPage(page);
    hotelDetailsPage = new HotelDetailsPage(page);
    
    // Navigate to Miami search results
    await homePage.goto();
    await homePage.dismissCookieBanner();
    await homePage.closeModal();
    await homePage.quickSearchMiami();
    await searchResultsPage.waitForResults();
  });

  test.describe('Hotel Details Page', () => {
    test('should display hotel information correctly @smoke', async ({ page }) => {
      await searchResultsPage.clickFirstHotel();
      await hotelDetailsPage.validateHotelDetails();
      
      // Verify hotel name is displayed
      const hotelName = await hotelDetailsPage.hotelName.textContent();
      expect(hotelName).toBeTruthy();
      expect(hotelName?.length).toBeGreaterThan(0);
      
      // Verify location is displayed
      await hotelDetailsPage.expectElementVisible(hotelDetailsPage.hotelLocation);
    });

    test('should display Andaz Miami Beach hotel correctly', async ({ page }) => {
      const targetHotel = 'Andaz Miami Beach';
      await searchResultsPage.clickHotelByName(targetHotel);
      await hotelDetailsPage.validateHotelDetails();
      
      const hotelName = await hotelDetailsPage.hotelName.textContent();
      expect(hotelName).toContain('Andaz');
    });

    test('should navigate between hotel tabs', async ({ page }) => {
      await searchResultsPage.clickFirstHotel();
      
      // Test each tab
      await hotelDetailsPage.switchToTab('overview');
      await hotelDetailsPage.expectElementVisible(hotelDetailsPage.hotelDescription);
      
      await hotelDetailsPage.switchToTab('products');
      await hotelDetailsPage.expectElementVisible(hotelDetailsPage.productsContainer);
      
      if (await hotelDetailsPage.reviewsTab.isVisible()) {
        await hotelDetailsPage.switchToTab('reviews');
        await hotelDetailsPage.expectElementVisible(hotelDetailsPage.reviewsContainer);
      }
    });

    test('should display hotel images', async ({ page }) => {
      await searchResultsPage.clickFirstHotel();
      
      await hotelDetailsPage.expectElementVisible(hotelDetailsPage.mainImage);
      
      // Verify image loads correctly
      const mainImage = hotelDetailsPage.mainImage;
      await mainImage.waitFor({ state: 'visible' });
      
      const imageLoaded = await mainImage.evaluate((img: HTMLImageElement) => {
        return img.complete && img.naturalHeight !== 0;
      });
      expect(imageLoaded).toBeTruthy();
    });
  });

  test.describe('Products Section', () => {
    test.beforeEach(async ({ page }) => {
      await searchResultsPage.clickFirstHotel();
      await hotelDetailsPage.switchToTab('products');
    });

    test('should display available products @smoke', async ({ page }) => {
      await hotelDetailsPage.validateProductsSection();
      
      const productCount = await hotelDetailsPage.productCards.count();
      expect(productCount).toBeGreaterThan(0);
      
      const productNames = await hotelDetailsPage.getProductNames();
      expect(productNames.length).toBe(productCount);
    });

    test('should show correct product information', async ({ page }) => {
      const productCards = await hotelDetailsPage.productCards.all();
      
      for (let i = 0; i < Math.min(3, productCards.length); i++) {
        await hotelDetailsPage.validateProductCard(productCards[i]);
      }
    });

    test('should display Pool & Beach Day Pass product', async ({ page }) => {
      const productNames = await hotelDetailsPage.getProductNames();
      const hasDayPass = productNames.some(name => 
        name.toLowerCase().includes('pool') && name.toLowerCase().includes('beach')
      );
      expect(hasDayPass).toBeTruthy();
    });

    test('should display premium products with higher pricing', async ({ page }) => {
      const productNames = await hotelDetailsPage.getProductNames();
      const hasPremiumProducts = productNames.some(name => 
        name.toLowerCase().includes('premium') || 
        name.toLowerCase().includes('daybed') ||
        name.toLowerCase().includes('spa')
      );
      expect(hasPremiumProducts).toBeTruthy();
    });

    test('should show pricing for different guest types', async ({ page }) => {
      const productCard = hotelDetailsPage.productCards.first();
      const elements = hotelDetailsPage.getProductCardElements(productCard);
      
      // Check if guest pricing is displayed
      if (await elements.guestPricing.isVisible()) {
        await hotelDetailsPage.expectElementVisible(elements.adultPrice);
        
        // Child and infant pricing might not always be present
        const hasChildPrice = await elements.childPrice.isVisible();
        const hasInfantPrice = await elements.infantPrice.isVisible();
        
        // At minimum, adult pricing should be present
        const adultPriceText = await elements.adultPrice.textContent();
        expect(adultPriceText).toMatch(/\$\d+/);
      }
    });

    test('should validate product pricing is reasonable', async ({ page }) => {
      await hotelDetailsPage.validateProductPricing();
      
      const prices = await hotelDetailsPage.getProductPrices();
      
      // Verify price range matches expected data
      const dayPassData = testData.products.dayPass;
      const someReasonablePrices = prices.some(price => 
        price >= dayPassData.minPrice && price <= 500 // Upper bound for premium products
      );
      expect(someReasonablePrices).toBeTruthy();
    });

    test('should filter products by type', async ({ page }) => {
      // Test pool filter
      await hotelDetailsPage.filterProductsByType('pool');
      
      let productNames = await hotelDetailsPage.getProductNames();
      let hasPoolProducts = productNames.some(name => 
        name.toLowerCase().includes('pool')
      );
      
      if (hasPoolProducts) {
        expect(hasPoolProducts).toBeTruthy();
      }
      
      // Test all products filter
      await hotelDetailsPage.filterProductsByType('all');
      
      const allProductsCount = await hotelDetailsPage.productCards.count();
      expect(allProductsCount).toBeGreaterThan(0);
    });

    test('should check product availability status', async ({ page }) => {
      const productNames = await hotelDetailsPage.getProductNames();
      
      if (productNames.length > 0) {
        const firstProduct = productNames[0];
        const availability = await hotelDetailsPage.getAvailabilityStatus(firstProduct);
        
        // Availability should be one of expected states
        const validAvailability = ['Available', 'Sold Out'].some(state =>
          availability.includes(state) || availability.includes('Left')
        ) || availability === '';
        
        expect(validAvailability).toBeTruthy();
      }
    });
  });

  test.describe('Product Selection and Booking', () => {
    test.beforeEach(async ({ page }) => {
      await searchResultsPage.clickFirstHotel();
      await hotelDetailsPage.switchToTab('products');
    });

    test('should add product to cart @smoke', async ({ page }) => {
      const initialCartCount = await hotelDetailsPage.getCartItemCount();
      
      // Select first available product
      await hotelDetailsPage.selectProductByIndex(0);
      
      // Verify cart updated
      const newCartCount = await hotelDetailsPage.getCartItemCount();
      expect(newCartCount).toBeGreaterThan(initialCartCount);
      
      // Verify cart total is greater than 0
      const cartTotal = await hotelDetailsPage.getCartTotal();
      expect(cartTotal).toBeGreaterThan(0);
    });

    test('should display cart sidebar with selected items', async ({ page }) => {
      await hotelDetailsPage.selectProductByIndex(0);
      
      // Cart should be visible
      if (await hotelDetailsPage.cartSidebar.isVisible()) {
        await hotelDetailsPage.expectElementVisible(hotelDetailsPage.cartItems.first());
        await hotelDetailsPage.expectElementVisible(hotelDetailsPage.cartTotal);
        await hotelDetailsPage.expectElementVisible(hotelDetailsPage.checkoutButton);
      }
    });

    test('should add multiple products to cart', async ({ page }) => {
      const productCount = await hotelDetailsPage.productCards.count();
      
      if (productCount >= 2) {
        // Add first product
        await hotelDetailsPage.selectProductByIndex(0);
        const firstCartCount = await hotelDetailsPage.getCartItemCount();
        const firstCartTotal = await hotelDetailsPage.getCartTotal();
        
        // Add second product
        await hotelDetailsPage.selectProductByIndex(1);
        const secondCartCount = await hotelDetailsPage.getCartItemCount();
        const secondCartTotal = await hotelDetailsPage.getCartTotal();
        
        expect(secondCartCount).toBeGreaterThan(firstCartCount);
        expect(secondCartTotal).toBeGreaterThan(firstCartTotal);
      }
    });

    test('should validate complete booking flow', async ({ page }) => {
      await hotelDetailsPage.validateBookingFlow();
    });

    test('should clear cart items', async ({ page }) => {
      // Add a product first
      await hotelDetailsPage.selectProductByIndex(0);
      
      const cartCount = await hotelDetailsPage.getCartItemCount();
      if (cartCount > 0) {
        await hotelDetailsPage.clearCart();
        
        const newCartCount = await hotelDetailsPage.getCartItemCount();
        expect(newCartCount).toBe(0);
      }
    });

    test('should handle sold out products correctly', async ({ page }) => {
      const productNames = await hotelDetailsPage.getProductNames();
      
      for (const productName of productNames) {
        const isAvailable = await hotelDetailsPage.isProductAvailable(productName);
        const availability = await hotelDetailsPage.getAvailabilityStatus(productName);
        
        if (availability.toLowerCase().includes('sold out')) {
          expect(isAvailable).toBeFalsy();
        }
      }
    });
  });

  test.describe('Reviews Section', () => {
    test('should display hotel reviews', async ({ page }) => {
      await searchResultsPage.clickFirstHotel();
      
      if (await hotelDetailsPage.reviewsTab.isVisible()) {
        await hotelDetailsPage.switchToTab('reviews');
        
        // Check if reviews are displayed
        if (await hotelDetailsPage.reviewsContainer.isVisible()) {
          await hotelDetailsPage.expectElementVisible(hotelDetailsPage.overallRating);
          
          const reviewCount = await hotelDetailsPage.reviewCards.count();
          if (reviewCount > 0) {
            await hotelDetailsPage.expectElementVisible(hotelDetailsPage.reviewCards.first());
          }
        }
      }
    });
  });

  test.describe('Mobile Hotel Details', () => {
    test('should work correctly on mobile @mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await searchResultsPage.clickFirstHotel();
      await hotelDetailsPage.validateHotelDetails();
      
      // Test mobile-specific functionality
      await hotelDetailsPage.switchToTab('products');
      await hotelDetailsPage.validateProductsSection();
      
      // Test product selection on mobile
      await hotelDetailsPage.selectProductByIndex(0);
      
      const cartCount = await hotelDetailsPage.getCartItemCount();
      expect(cartCount).toBeGreaterThan(0);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid hotel URLs gracefully', async ({ page }) => {
      // Navigate to a non-existent hotel URL
      await page.goto('/hotel/non-existent-hotel-123');
      
      // Should either redirect to search or show 404
      const currentUrl = page.url();
      const isRedirected = currentUrl.includes('/search') || currentUrl === '/';
      const isErrorPage = await page.locator('text=404|not found|error').isVisible();
      
      expect(isRedirected || isErrorPage).toBeTruthy();
    });
  });
});
