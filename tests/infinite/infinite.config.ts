import { SiteConfig } from '../../automation/core/siteAdapter';

export const siteConfig: SiteConfig = {
  siteName: 'Infinite Computer Solutions',
  baseURL: 'https://www.infinite.com',
  siteType: 'generic',
  headless: process.env.HEADLESS !== 'false',
  flows: [
    'Navigation Verification',
    'Solutions Dropdown Testing',
    'Content Carousel Validation',
    'Contact Form Submission',
    'Global Offices Verification'
  ],
  selectors: {
    searchBox: '[data-testid="search"], input[type="search"]',
    loginButton: 'button:has-text("Login"), a:has-text("Login")',
    navigationMenu: 'nav[role="navigation"], .main-navigation, header nav',
    mainContent: 'main, .main-content, [role="main"]'
  },
  timeouts: {
    navigation: 45000,
    action: 15000,
    validation: 12000
  },
  specialHandling: {
    cookieConsent: true,
    antiBot: false,
    dynamicContent: true,
    singlePageApp: false
  }
};

// Site-specific selectors for Infinite.com
export const infiniteSelectors = {
  // Navigation
  mainNav: 'banner ul, header ul, nav ul, .nav-menu',
  solutionsMenu: 'banner li:has-text("Solutions"), nav li:has-text("Solutions"), header li:has-text("Solutions")',
  solutionsDropdown: 'ul:has(a[href*="brassring-solutions"]), .dropdown-menu',
  aboutUsLink: 'a.mega-menu-link[href$="/about-us/"]',
  careersLink: 'a.mega-menu-link[href$="/careers/"], a[href$="/careers/"]',
  
  // Hero section
  heroSection: 'region[aria-label*="Slides"], region:has-text("Slides"), .hero-slider, .carousel, .hero-section',
  heroSlider: 'region[aria-label*="Slides"], region:has-text("Slides"), .hero-slider, .carousel',
  heroSlides: 'div[role="group"], .slide, .carousel-item',
  heroNextButton: 'button:has-text("Next slide")',
  heroPrevButton: 'button:has-text("Previous slide")',
  heroIndicators: 'button:has-text("Go to slide")',
  
  // Services carousel
  servicesCarousel: 'region[aria-label*="Image Carousel"], .services-carousel',
  servicesSlides: 'div[role="group"]:has(a[href*="/"])',
  servicesNextButton: 'button:has-text("Next slide"):nth(1)',
  servicesPrevButton: 'button:has-text("Previous slide"):nth(1)',
  
  // Industry tabs
  industryTabs: 'div[role="tablist"]:not(.elementor-tabs-content-wrapper)',
  healthcareTab: 'div[role="tablist"] button:has-text("Healthcare")',
  bankingTab: 'div[role="tablist"] button:has-text("Banking & Financial Services")',
  
  // Content areas
  industryFocus: 'heading:has-text("Industry Focus")',
  servicesSection: 'heading:has-text("Future Ready Services")',
  testimonialsSection: 'heading:has-text("What Our Clients Say")',
  
  // Footer
  footer: 'contentinfo, footer',
  socialLinks: 'a[href*="linkedin"], a[href*="twitter"], a[href*="facebook"]',
  globalOffices: '.office-locations, .offices, .locations-section',
  
      // Cookie consent dialog selectors - Infinite.com uses Cookiebot CMP
    cookieDialog: [
      'button[aria-label*="Open CMP widget"]',
      'button:has-text("Open CMP widget")',
      '.cmp-widget',
      '#cookiebot-dialog',
      '[data-testid="cookie-consent-dialog"]',
      '[id*="cookieConsent"]',
      '[class*="cookie-consent"]',
      '[class*="cookie-banner"]',
      '.cookie-notice',
      '.gdpr-banner',
      '.privacy-banner'
    ],

    // Cookie accept button selectors - Based on actual Cookiebot implementation
    acceptCookiesButton: [
      'button:has-text("Change your consent")',
      'button[aria-label*="Close CMP widget"]',
      'button:has-text("Close CMP widget")',
      '[data-testid="accept-cookies"]',
      '[data-testid="accept-all-cookies"]',
      'button[id*="accept"]',
      'button[class*="accept"]',
      'button:has-text("Accept All")',
      'button:has-text("Accept Cookies")',
      'button:has-text("I Accept")',
      'button:has-text("Allow All")',
      '.cookie-accept-button'
    ],
  
    // Generic fallbacks
  buttons: 'button, input[type="button"], input[type="submit"]',
  links: 'a[href]',
  headings: 'h1, h2, h3, h4, h5, h6',
};

// Performance thresholds
export const performanceThresholds = {
  // Allow a bit more headroom due to Cookiebot and third-party scripts variability
  maxPageLoadTime: 10000,
  maxCarouselTransition: 1000,
  maxImageLoadTime: 3000
};

export default siteConfig;
