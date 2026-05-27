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
  selectors: {
    navigationMenu: string;
    searchBox: string;
    mainContent: string;
    footer: string;
  };
  flows: string[];
  specialHandling: {
    cookieConsent: boolean;
    antiBot: boolean;
    dynamicContent: boolean;
    singlePageApp: boolean;
  };
}
