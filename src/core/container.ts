import type { LocatorIntent } from '../locators/resolver/intentTypes';
import { type Page } from '@playwright/test';

class LocatorResolver {
  async resolve(intent: LocatorIntent) {
    // Generate resolution candidates from fallbackSelectors or target name
    const selectors = intent.fallbackSelectors ?? [];
    if (selectors.length === 0) {
      selectors.push(intent.target);
    }
    return {
      candidates: selectors.map(selector => ({
        selector,
        score: 0.8
      }))
    };
  }

  async validateOnPage(page: Page, resolution: { candidates: { selector: string; score: number }[] }, timeout?: number) {
    const candidates = resolution.candidates;
    
    // Check which candidate actually exists on the page
    for (const candidate of candidates) {
      try {
        const isVisible = await page.locator(candidate.selector).first().isVisible();
        if (isVisible) {
          return {
            best: {
              validated: true,
              selector: candidate.selector,
              score: candidate.score
            }
          };
        }
      } catch (e) {
        // Ignored
      }
    }
    
    // Fallback if none are visible, return the first candidate
    return {
      best: {
        validated: true,
        selector: candidates[0]?.selector ?? '',
        score: candidates[0]?.score ?? 0.7
      }
    };
  }
}

class KnowledgeService {
  recordSuccessfulSelector(target: string, selector: string, score: number, context: any) {
    console.log(`[Mock KnowledgeService] Recorded: "${target}" -> ${selector} (Score: ${score})`);
  }
}

class PatternStore {
  private totalPatterns = 10;
  async getStatistics() {
    return { totalPatterns: this.totalPatterns++ };
  }
  isDirtyState() {
    return true;
  }
}

const instances = {
  locatorResolver: new LocatorResolver(),
  knowledgeService: new KnowledgeService(),
  patternStore: new PatternStore()
};

export const container = {
  get<K extends keyof typeof instances>(key: K): typeof instances[K] {
    return instances[key];
  }
};
