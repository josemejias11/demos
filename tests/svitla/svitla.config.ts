// Extended selector typing for Svitla site
export interface SvitlaSelectors {
  navigationMenu: string;
  mainContent: string;
  heroSection: string;
  solutionsMenu: string;
  solutionsDropdown: string;
  industryTabs: string;
  footer: string;
  contactLink: string;
}

export interface SvitlaSiteConfig {
  siteName: string;
  baseURL: string;
  siteType: string;
  headless: boolean;
  flows: string[];
  selectors: SvitlaSelectors;
  timeouts: {
    navigation: number;
    action: number;
    validation: number;
  };
  specialHandling: {
    cookieConsent: boolean;
    antiBot: boolean;
    dynamicContent: boolean;
    singlePageApp: boolean;
  };
}

export const siteConfig: SvitlaSiteConfig = {
  siteName: 'Svitla Systems',
  baseURL: 'https://svitla.com',
  siteType: 'generic',
  headless: process.env.HEADLESS !== 'false',
  flows: [
    'Navigation Verification',
    'Solutions Dropdown Testing',
    'Hero Carousel Validation',
    'Industry Tabs Interaction',
    'Content Sections Verification',
    'Footer Verification'
  ],
  selectors: {
    navigationMenu: 'nav, header nav, nav.main-nav',
    mainContent: 'main, [role="main"], .main-content',
    // Hero selectors prioritized by heading anchors discovered in live snapshot
    heroSection: 'main h2:has-text("SVITLA AI"), main h3:has-text("Gets You to ROI Positive Faster"), main:has-text("Shaping the Digital Horizon")',
    // Primary site uses label "Expertise" for the top-level menu
    solutionsMenu: 'nav >> text=Expertise, nav li:has-text("Expertise")',
    solutionsDropdown: 'nav li:has-text("Expertise") ul, nav ul[role="menu"]',
    industryTabs: '.home-services__item, [role="tablist"], section:has-text("Services we provide")',
    footer: 'footer, footer.site-footer, [role="contentinfo"]',
    contactLink: 'a[href*="/contacts"], a:has-text("Contact")',
    // Add more as needed
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

export const performanceThresholds = {
  maxPageLoadTime: 10000,
  maxCarouselTransition: 1200,
  maxImageLoadTime: 3500
};

export default siteConfig;
