// Site configuration type definitions

export interface SiteConfig {
  baseURL: string;
  siteName: string;
  siteType: 'generic' | 'ecommerce' | 'blog' | 'custom';
  headless: boolean;
  timeouts: {
    navigation: number;
    action: number;
    validation: number;
  };
  selectors: {
    navigationMenu?: string;
    searchBox?: string;
    mainContent?: string;
    footer?: string;
    [key: string]: string | undefined;
  };
  flows: string[];
  specialHandling: {
    cookieConsent?: boolean;
    antiBot?: boolean;
    dynamicContent?: boolean;
    singlePageApp?: boolean;
    [key: string]: boolean | undefined;
  };
}
