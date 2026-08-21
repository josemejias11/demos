export class KnowledgeService {
  recordSuccessfulSelector(target: string, selector: string, score: number, extra?: any): void {
    // Base class implementation; subclasses and tests override
  }

  getSelectorsForTarget(target: string): string[] {
    // Base class implementation; subclasses and tests override
    return [];
  }
}
