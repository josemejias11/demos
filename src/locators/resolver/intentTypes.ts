export interface LocatorIntent {
  target: string;
  action: string;
  roleHint?: string;
  synonyms?: string[];
  fallbackSelectors?: string[];
}
