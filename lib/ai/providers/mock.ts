/**
 * Mock Provider — For development, testing, and fallbacks.
 */

import { BaseAIProvider, ProviderOptions, ProviderResponse } from './base';
import { ProviderType } from '../types';

export class MockProvider extends BaseAIProvider {
  readonly type: ProviderType = 'mock' as any; // build compat; real mock uses fallback logic
  readonly name = 'Mock (Development)';

  async generate(prompt: string, _options: ProviderOptions = {}): Promise<ProviderResponse> { // _options retained for router extensibility (model/temp etc)
    void _options;
    const start = Date.now();
    await new Promise(r => setTimeout(r, 80 + Math.random() * 120));

    const tokens = 120 + Math.floor(prompt.length / 4);
    const cost = this.calculateCost(tokens, 0.003);

    return {
      content: `[MOCK] High-quality output for: ${prompt.substring(0, 120)}...\n\n[In production this would be rich, on-brand, structured content from Claude or GPT-4o with proper schema, links, and metadata.]`,
      tokensUsed: tokens,
      costUsd: cost,
      model: 'mock-v1',
      provider: this.type,
      latencyMs: Date.now() - start,
    };
  }
}
