export interface LocatorIntent {
  target: string;
  action: string;
  roleHint?: string;
  synonyms?: string[];
  fallbackSelectors?: string[];
}

export interface Candidate {
  selector: string;
  score: number;
  strategy: string;
  validated: boolean;
}

export interface ResolutionResult {
  intent: LocatorIntent;
  best: Candidate | null;
  candidates: Candidate[];
}
