// Site-specific configuration for jobsity.com
import type { SiteConfig } from '../../src/core/siteAdapter';
import '../../src/core/siteAdapter';

export const siteConfig: SiteConfig = {
  "paths": {
    "robots": "/robots.txt",
    "sitemap": "/sitemap.xml",
    "contactPage": "/contact-us",
    "caseStudies": "/insights/client-success-stories"
  },
  "baseURL": "https://www.jobsity.com",
  "siteName": "jobsity.com",
  "siteType": "generic",
  "headless": true,
  "timeouts": {
    "navigation": 20000,
    "action": 4000,
    "validation": 3000
  },
  "selectors": {
    "navigationMenu": "nav, .navigation, .main-nav, .navbar",
    "searchBox": "[name=\"search\"], .search-input, #search",
    "mainContent": "main, .main-content, .content, #content",
    "footer": "footer, .footer, .site-footer",
    "hero": ".hero, .main-hero, #hero, .hero-section",
    "primaryCTA": ".cta, .primary-cta, .btn-primary, [data-cta]",
    "expertiseLinks": ".expertise-links, .skills-list, .tech-portfolio",
    "caseStudies": ".case-studies, .success-stories, .client-success",
    "contactLink": "a[href*=contact], .contact-link, #contact"
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
