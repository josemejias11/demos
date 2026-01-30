// Site-specific configuration for msd.com

export interface SiteConfig {
  baseURL: string;
  siteName: string;
  siteType: string;
  headless: boolean;
  timeouts: {
    navigation: number;
    action: number;
    validation: number;
  };
  selectors: Record<string, string>;
  flows: string[];
  specialHandling: {
    cookieConsent: boolean;
    antiBot: boolean;
    dynamicContent: boolean;
    singlePageApp: boolean;
  };
}

export const siteConfig: SiteConfig = {
  "baseURL": "https://www.msd.com",
  "siteName": "msd.com",
  "siteType": "generic",
  "headless": true,
  "timeouts": {
    "navigation": 8000,
    "action": 4000,
    "validation": 3000
  },
  "selectors": {
    "navigationMenu": "nav, .navigation, .main-nav, .navbar",
    "searchBox": "[name=\"search\"], .search-input, #search",
    "mainContent": "main, .main-content, .content, #content",
    "footer": "footer, .footer, .site-footer"
  },
  "flows": [
    "basic-navigation",
    "form-interaction",
    "content-verification"
  ],
  "specialHandling": {
    "cookieConsent": true,
    "antiBot": false,
    "dynamicContent": true,
    "singlePageApp": false
  }
};

export default siteConfig;
