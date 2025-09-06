import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HotelDetailsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Hotel information
  get hotelName() {
    return this.page.locator('[data-testid="hotel-name"], .hotel-name, h1');
  }

  get hotelRating() {
    return this.page.locator('[data-testid="rating"], .rating, .stars');
  }

  get hotelLocation() {
    return this.page.locator('[data-testid="location"], .location, .address');
  }

  get hotelDescription() {
    return this.page.locator('[data-testid="description"], .description, .hotel-description');
  }

  get hotelImages() {
    return this.page.locator('[data-testid="hotel-images"], .hotel-images, .gallery');
  }

  get mainImage() {
    return this.page.locator('[data-testid="main-image"], .main-image, .hero-image img');
  }

  // Navigation tabs
  get tabNavigation() {
    return this.page.locator('[data-testid="tabs"], .tabs, .tab-navigation');
  }

  get overviewTab() {
    return this.page.getByRole('tab', { name: /overview/i });
  }

  get productsTab() {
    return this.page.getByRole('tab', { name: /products|passes/i });
  }

  get reviewsTab() {
    return this.page.getByRole('tab', { name: /reviews/i });
  }

  get amenitiesTab() {
    return this.page.getByRole('tab', { name: /amenities/i });
  }

  // Date and guest selection
  get dateSelector() {
    return this.page.locator('[data-testid="date-selector"], .date-picker');
  }

  get selectedDate() {
    return this.page.locator('[data-testid="selected-date"], .selected-date');
  }

  get changeDateButton() {
    return this.page.getByRole('button', { name: /change date|select date/i });
  }

  // Products section
  get productsContainer() {
    return this.page.locator('[data-testid="products"], .products, .passes');
  }

  get productCards() {
    return this.page.locator('[data-testid="product-card"], .product-card, .pass-card');
  }

  get productFilters() {
    return this.page.locator('[data-testid="product-filters"], .product-filters');
  }

  get allProductsFilter() {
    return this.page.getByRole('button', { name: /all/i });
  }

  get beachProductsFilter() {
    return this.page.getByRole('button', { name: /beach/i });
  }

  get poolProductsFilter() {
    return this.page.getByRole('button', { name: /pool/i });
  }

  get spaProductsFilter() {
    return this.page.getByRole('button', { name: /spa/i });
  }

  // Individual product elements
  getProductCardElements(productCard: Locator) {
    return {
      name: productCard.locator('[data-testid="product-name"], .product-name, h3, h4'),
      image: productCard.locator('[data-testid="product-image"], .product-image, img'),
      description: productCard.locator('[data-testid="product-description"], .product-description'),
      price: productCard.locator('[data-testid="price"], .price'),
      originalPrice: productCard.locator('[data-testid="original-price"], .original-price'),
      discount: productCard.locator('[data-testid="discount"], .discount'),
      availability: productCard.locator('[data-testid="availability"], .availability'),
      amenities: productCard.locator('[data-testid="amenities"], .amenities, .features'),
      selectButton: productCard.getByRole('button', { name: /select|choose|book/i }),
      guestPricing: productCard.locator('[data-testid="guest-pricing"], .guest-pricing'),
      adultPrice: productCard.locator('[data-testid="adult-price"], .adult-price'),
      childPrice: productCard.locator('[data-testid="child-price"], .child-price'),
      infantPrice: productCard.locator('[data-testid="infant-price"], .infant-price')
    };
  }

  // Reviews section
  get reviewsContainer() {
    return this.page.locator('[data-testid="reviews"], .reviews');
  }

  get overallRating() {
    return this.page.locator('[data-testid="overall-rating"], .overall-rating');
  }

  get reviewCards() {
    return this.page.locator('[data-testid="review-card"], .review-card');
  }

  get writeReviewButton() {
    return this.page.getByRole('button', { name: /write review|add review/i });
  }

  // Amenities section
  get amenitiesContainer() {
    return this.page.locator('[data-testid="amenities"], .amenities-section');
  }

  get amenityCategories() {
    return this.page.locator('[data-testid="amenity-category"], .amenity-category');
  }

  // Booking/cart functionality
  get cartSidebar() {
    return this.page.locator('[data-testid="cart"], .cart-sidebar, .booking-sidebar');
  }

  get cartItems() {
    return this.page.locator('[data-testid="cart-item"], .cart-item');
  }

  get cartTotal() {
    return this.page.locator('[data-testid="cart-total"], .cart-total, .total-price');
  }

  get checkoutButton() {
    return this.page.getByRole('button', { name: /checkout|continue|proceed/i });
  }

  get clearCartButton() {
    return this.page.getByRole('button', { name: /clear cart|remove all/i });
  }

  // Actions
  async switchToTab(tabName: 'overview' | 'products' | 'reviews' | 'amenities') {
    const tabs = {
      overview: this.overviewTab,
      products: this.productsTab,
      reviews: this.reviewsTab,
      amenities: this.amenitiesTab
    };

    const tab = tabs[tabName];
    if (await tab.isVisible()) {
      await tab.click();
      
      // Wait for tab content to load
      const tabContent = this.page.locator(`[data-testid="${tabName}"], .${tabName}`);
      await tabContent.waitFor({ state: 'visible' });
      await this.waitForPageLoad();
    }
  }

  async selectProduct(productName: string) {
    const productCard = this.productCards.filter({ hasText: productName });
    await this.expectElementVisible(productCard);
    
    const productElements = this.getProductCardElements(productCard);
    await productElements.selectButton.click();
    
    // Wait for cart to update or modal to appear
    await this.page.waitForTimeout(1000);
  }

  async selectProductByIndex(index: number) {
    const productCard = this.productCards.nth(index);
    await this.expectElementVisible(productCard);
    
    const productElements = this.getProductCardElements(productCard);
    await productElements.selectButton.click();
    
    await this.page.waitForTimeout(1000);
  }

  async filterProductsByType(type: 'all' | 'beach' | 'pool' | 'spa') {
    const filters = {
      all: this.allProductsFilter,
      beach: this.beachProductsFilter,
      pool: this.poolProductsFilter,
      spa: this.spaProductsFilter
    };

    const filter = filters[type];
    if (await filter.isVisible()) {
      await filter.click();
      
      // Wait for products to filter
      await this.page.waitForTimeout(500);
      await this.productsContainer.waitFor({ state: 'visible' });
    }
  }

  async getProductNames(): Promise<string[]> {
    const names: string[] = [];
    const cards = await this.productCards.all();
    
    for (const card of cards) {
      const nameElement = this.getProductCardElements(card).name;
      const name = await nameElement.textContent();
      if (name) {
        names.push(name.trim());
      }
    }
    
    return names;
  }

  async getProductPrices(): Promise<number[]> {
    const prices: number[] = [];
    const cards = await this.productCards.all();
    
    for (const card of cards) {
      const priceElement = this.getProductCardElements(card).price;
      const priceText = await priceElement.textContent();
      if (priceText) {
        const price = parseInt(priceText.replace(/[^\d]/g, ''));
        if (!isNaN(price)) {
          prices.push(price);
        }
      }
    }
    
    return prices;
  }

  async getAvailabilityStatus(productName: string): Promise<string> {
    const productCard = this.productCards.filter({ hasText: productName });
    const productElements = this.getProductCardElements(productCard);
    
    if (await productElements.availability.isVisible()) {
      return await productElements.availability.textContent() || '';
    }
    
    return 'Available';
  }

  async isProductAvailable(productName: string): Promise<boolean> {
    const productCard = this.productCards.filter({ hasText: productName });
    const productElements = this.getProductCardElements(productCard);
    
    // Check if select button is enabled
    const isButtonEnabled = await productElements.selectButton.isEnabled();
    
    // Check availability text
    const availabilityText = await this.getAvailabilityStatus(productName);
    const isSoldOut = availabilityText.toLowerCase().includes('sold out');
    
    return isButtonEnabled && !isSoldOut;
  }

  async getCartItemCount(): Promise<number> {
    if (await this.cartItems.first().isVisible()) {
      return await this.cartItems.count();
    }
    return 0;
  }

  async getCartTotal(): Promise<number> {
    if (await this.cartTotal.isVisible()) {
      const totalText = await this.cartTotal.textContent();
      if (totalText) {
        return parseInt(totalText.replace(/[^\d]/g, '')) || 0;
      }
    }
    return 0;
  }

  async proceedToCheckout() {
    await this.expectElementVisible(this.checkoutButton);
    await this.checkoutButton.click();
    
    // Wait for navigation to checkout page
    await this.page.waitForURL(/.*\/checkout.*|.*\/booking.*/);
    await this.waitForPageLoad();
  }

  async clearCart() {
    if (await this.clearCartButton.isVisible()) {
      await this.clearCartButton.click();
      
      // Wait for cart to empty
      await this.cartItems.first().waitFor({ state: 'detached' });
    }
  }

  // Validation methods
  async validateHotelDetails() {
    await this.expectElementVisible(this.hotelName);
    await this.expectElementVisible(this.hotelLocation);
    await this.expectElementVisible(this.mainImage);
    await this.expectElementVisible(this.tabNavigation);
  }

  async validateProductsSection() {
    await this.switchToTab('products');
    await this.expectElementVisible(this.productsContainer);
    
    const productCount = await this.productCards.count();
    expect(productCount).toBeGreaterThan(0);
    
    // Validate first product card
    if (productCount > 0) {
      const firstProduct = this.productCards.first();
      const productElements = this.getProductCardElements(firstProduct);
      
      await this.expectElementVisible(productElements.name);
      await this.expectElementVisible(productElements.price);
      await this.expectElementVisible(productElements.selectButton);
    }
  }

  async validateProductPricing() {
    const prices = await this.getProductPrices();
    
    for (const price of prices) {
      expect(price).toBeGreaterThan(0);
      expect(price).toBeLessThan(1000); // Reasonable upper limit
    }
  }

  async validateProductCard(productCard: Locator) {
    const elements = this.getProductCardElements(productCard);
    
    await this.expectElementVisible(elements.name);
    await this.expectElementVisible(elements.price);
    await this.expectElementVisible(elements.selectButton);
    
    // Validate price format
    const priceText = await elements.price.textContent();
    expect(priceText).toMatch(/\$\d+/);
    
    // Validate availability status
    if (await elements.availability.isVisible()) {
      const availabilityText = await elements.availability.textContent();
      expect(availabilityText).toMatch(/Available|Only \d+ Left|Sold Out/i);
    }
  }

  async validateBookingFlow() {
    // Select a product
    const productCount = await this.productCards.count();
    if (productCount > 0) {
      await this.selectProductByIndex(0);
      
      // Validate cart updates
      const cartCount = await this.getCartItemCount();
      expect(cartCount).toBeGreaterThan(0);
      
      const cartTotal = await this.getCartTotal();
      expect(cartTotal).toBeGreaterThan(0);
      
      // Validate checkout button is available
      await this.expectElementVisible(this.checkoutButton);
    }
  }
}
