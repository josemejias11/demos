// Site-specific configuration for moodys.com
import type { SiteConfig } from '@core/siteAdapter';
import '@core/siteAdapter';

export const siteConfig: SiteConfig = {
  "baseURL": "https://www.moodys.com/",
  "siteName": "moodys.com",
  "siteType": "finance",
  "headless": true,
  "timeouts": {
    "navigation": 15000,
    "action": 5000,
    "validation": 4000
  },
  "selectors": {
    "navigationMenu": "header, [class*='nav'], [class*='header'], [class*='menu']",
    "searchBox": "[class*='search'] input, input[type='search'], [placeholder*='search' i]",
    "mainContent": "[class*='content'], [class*='main'], [class*='body'], section",
    "footer": "footer, [class*='footer']"
  },
  "flows": [
    "basic-navigation",
    "content-verification",
    "seo-check"
  ],
  "specialHandling": {
    "cookieConsent": true,
    "antiBot": true,
    "dynamicContent": true,
    "singlePageApp": false
  }
};

export default siteConfig;
