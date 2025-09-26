export interface SiteConfig {
  siteName: string;
  baseURL: string;
  siteType: string;
  headless: boolean;
  flows?: string[];
  selectors?: Record<string, string>;
  timeouts?: { [k: string]: number };
  specialHandling?: { [k: string]: boolean };
}

export default SiteConfig;
