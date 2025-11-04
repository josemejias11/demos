// Site-specific configuration for jbs.dev
// import type { SiteConfig } from '../../src/core/siteAdapter';
// import '../../src/core/siteAdapter';

export const siteConfig = {
  "baseURL": "https://www.jbs.dev",
  "siteName": "jbs.dev",
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
    "footer": "footer, .footer, .site-footer",
    "hero": "header, .hero, .site-hero, #hero",
    "primaryCTA": "a:has-text('Let\'s Collaborate'), a:has-text('Get in Touch'), a[href*='/our-team/contact-us']",
    "expertiseLinks": "a[href*='/expertise'], a[href*='/expertise/']",
    "caseStudies": "a[href*='/resources/resource-center/case-studies']",
    "contactLink": "a[href*='/our-team/contact-us'], a:has-text('Contact')"
  },
  // @ts-ignore - generated convenience fields for test templates
  "paths": {
    "contactPage": "/our-team/contact-us",
    "caseStudies": "/resources/resource-center/case-studies",
    "robots": "/robots.txt",
    "sitemap": "/sitemap.xml"
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
