// Site-specific configuration for planatechnologies.com
import type { SiteConfig } from './src/core/siteAdapter';

export const siteConfig: SiteConfig = {
  "baseURL": "https://planatechnologies.com",
  "siteName": "planatechnologies.com",
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
