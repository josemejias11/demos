import type { LocatorIntent, Candidate, ResolutionResult } from './intentTypes';
import { LocatorResolver } from './locatorResolver';
import { EventBus } from '../../core/eventBus';
import { KnowledgeService } from '../../knowledge/knowledgeService';

interface SmartLocateOptions {
  click?: boolean;
  allowHeal?: boolean;
}

interface SmartLocateServices {
  resolver: LocatorResolver;
  knowledge: KnowledgeService;
  eventBus: EventBus;
}

interface SmartLocateResult {
  validated?: Candidate;
  usedFallback?: boolean;
  resolution: ResolutionResult;
}

export async function smartLocate(
  page: any,
  intent: LocatorIntent,
  options: SmartLocateOptions,
  services: SmartLocateServices
): Promise<SmartLocateResult> {
  // Step 1: Attempt primary resolution
  const resolution = await services.resolver.resolve(intent);

  let validated: Candidate | undefined;
  let usedFallback = false;

  // Step 2: Try to validate best candidate if it exists
  if (resolution.best) {
    try {
      await page.locator(resolution.best.selector).waitFor();
      validated = resolution.best;
      services.knowledge.recordSuccessfulSelector(
        intent.target,
        resolution.best.selector,
        resolution.best.score,
        undefined
      );
    } catch (e) {
      // Primary validation failed, will try fallbacks
    }
  }

  // Step 3: Try fallbacks if primary didn't succeed
  if (!validated && intent.fallbackSelectors && intent.fallbackSelectors.length > 0) {
    for (const selector of intent.fallbackSelectors) {
      try {
        await page.locator(selector).waitFor();
        // Fallback succeeded
        validated = {
          selector,
          score: 0,
          strategy: 'fallback',
          validated: true,
        };
        usedFallback = true;
        resolution.candidates.push(validated);
        services.knowledge.recordSuccessfulSelector(intent.target, selector, 0, undefined);
        break;
      } catch (e) {
        // This fallback didn't work, try next
      }
    }
  }

  // Step 4: Emit event
  services.eventBus.emit('selector-resolved', { validated, usedFallback });

  // Step 5: Return result
  return {
    validated,
    usedFallback: usedFallback || undefined,
    resolution,
  };
}
