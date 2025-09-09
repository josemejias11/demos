import { describe, it, expect, vi } from 'vitest';
import type { LocatorIntent, Candidate, ResolutionResult } from '../automation/locators/resolver/intentTypes';
import { smartLocate } from '../automation/locators/resolver/locatorWrapper';
import { EventBus } from '../automation/core/eventBus';
import { KnowledgeService } from '../automation/knowledge/knowledgeService';
import { LocatorResolver } from '../automation/locators/resolver/locatorResolver';

// Minimal stubs for Playwright Page & Locator
function createPageStub(visibleSelectors: Set<string>) {
  return {
    locator: (selector: string) => {
      const api = {
        first: () => api,
        async waitFor() {
          if (!visibleSelectors.has(selector)) {
            // Simulate timeout for non-visible selectors
            throw new Error('Timeout 300ms');
          }
        },
        async isVisible() {
          return visibleSelectors.has(selector);
        },
        async click() {
          return Promise.resolve();
        },
      };
      return api;
    },
  } as unknown as import('playwright').Page;
}

describe('smartLocate wrapper', () => {
  it('records successful selector and returns locator when validation succeeds', async () => {
    const intent: LocatorIntent = {
      target: 'Primary CTA',
      action: 'click',
      roleHint: 'a',
      synonyms: ['cta'],
      fallbackSelectors: ['#fb'],
    };
    const candidate: Candidate = { selector: '#ok', score: 0.9, strategy: 'kb', validated: true };
    const resolution: ResolutionResult = { intent, best: candidate, candidates: [candidate] };
    class ResolverMock extends LocatorResolver {
      constructor() { super(new EventBus(), new KnowledgeService()); }
      resolve = vi.fn().mockResolvedValue(resolution);
      validateOnPage = vi.fn().mockResolvedValue(resolution);
    }
    class KnowledgeMock extends KnowledgeService {
      recordSuccessfulSelector = vi.fn();
      getSelectorsForTarget = vi.fn().mockReturnValue([]);
    }
    class EventBusMock extends EventBus { emit = vi.fn(); }
    const resolver = new ResolverMock();
    const knowledge = new KnowledgeMock();
    const eventBus = new EventBusMock();
    const page = createPageStub(new Set(['#ok']));

    const out = await smartLocate(page, intent, { click: true }, { resolver, knowledge, eventBus });

    expect(out.validated?.selector).toBe('#ok');
    expect(knowledge.recordSuccessfulSelector).toHaveBeenCalledWith(
      intent.target,
      '#ok',
      0.9,
      undefined,
    );
    expect(eventBus.emit).toHaveBeenCalled();
  });

  it('falls back to provided selectors when initial validation fails', async () => {
    const intent: LocatorIntent = {
      target: 'Secondary CTA',
      action: 'click',
      // first missing, second will become visible
      fallbackSelectors: ['#missing', '#fb-success'],
    };
    const initial: ResolutionResult = { intent, best: null, candidates: [] };
    const afterValidate: ResolutionResult = { intent, best: null, candidates: [] };
    class ResolverMock2 extends LocatorResolver {
      constructor() { super(new EventBus(), new KnowledgeService()); }
      resolve = vi.fn().mockResolvedValue(initial);
      validateOnPage = vi.fn().mockResolvedValue(afterValidate);
    }
    class KnowledgeMock2 extends KnowledgeService {
      recordSuccessfulSelector = vi.fn();
      getSelectorsForTarget = vi.fn().mockReturnValue([]);
    }
    class EventBusMock2 extends EventBus { emit = vi.fn(); }
    const resolver = new ResolverMock2();
    const knowledge = new KnowledgeMock2();
    const eventBus = new EventBusMock2();
    const page = createPageStub(new Set(['#fb-success']));

    const out = await smartLocate(page, intent, { allowHeal: false }, { resolver, knowledge, eventBus });
    // Debug aid if failing
    if (!out.validated) {
      console.error('Candidates after fallback', out.resolution.candidates.map(c=>({s:c.selector,v:c.validated})));
    }
    expect(out.validated?.selector).toBe('#fb-success');
    expect(out.usedFallback).toBe(true);
    expect(knowledge.recordSuccessfulSelector).toHaveBeenCalled();
  });
});
