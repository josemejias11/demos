import { EventBus } from '../../core/eventBus';
import { KnowledgeService } from '../../knowledge/knowledgeService';
import type { LocatorIntent, ResolutionResult } from './intentTypes';

export class LocatorResolver {
  constructor(protected eventBus: EventBus, protected knowledge: KnowledgeService) {}

  async resolve(intent: LocatorIntent): Promise<ResolutionResult> {
    // Base class stub; subclasses and tests override
    return { intent, best: null, candidates: [] };
  }

  async validateOnPage(result: ResolutionResult, page: any): Promise<ResolutionResult> {
    // Base class stub; subclasses and tests override
    return result;
  }
}
