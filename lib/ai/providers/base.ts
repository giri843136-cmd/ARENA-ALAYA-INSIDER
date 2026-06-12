/**
 * ALAYA INSIDER — AI Provider Base
 * Abstract provider with routing, fallbacks, cost tracking, retries.
 * Production-ready abstraction.
 */

import { ProviderType } from '../types';

export interface ProviderOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface ProviderResponse {
  content: string;
  tokensUsed: number;
  costUsd: number;
  model: string;
  provider: ProviderType;
  latencyMs: number;
}

export abstract class BaseAIProvider {
  abstract readonly type: ProviderType;
  abstract readonly name: string;

  abstract generate(prompt: string, options?: ProviderOptions): Promise<ProviderResponse>;

  protected calculateCost(tokens: number, costPer1k: number): number {
    return (tokens / 1000) * costPer1k;
  }

  protected async withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries) throw error;
        await new Promise(r => setTimeout(r, 300 * Math.pow(2, i)));
      }
    }
    throw new Error('Max retries exceeded');
  }
}

export interface ProviderRouterOptions {
  preferredProvider?: ProviderType;
  fallbackProviders?: ProviderType[];
  maxCostUsd?: number;
}

export class AIProviderRouter {
  private providers = new Map<ProviderType, BaseAIProvider>();

  register(provider: BaseAIProvider) {
    this.providers.set(provider.type, provider);
  }

  async generate(
    prompt: string,
    options: ProviderOptions = {},
    routerOptions: ProviderRouterOptions = {}
  ): Promise<ProviderResponse> {
    const preferred = routerOptions.preferredProvider || 'anthropic';
    const fallbacks = routerOptions.fallbackProviders || ['openai', 'anthropic' as any];

    const candidates = [preferred, ...fallbacks.filter(p => p !== preferred)];

    for (const providerType of candidates) {
      const provider = this.providers.get(providerType);
      if (!provider) continue;

      try {
        const response = await provider.generate(prompt, options);

        if (routerOptions.maxCostUsd && response.costUsd > routerOptions.maxCostUsd) {
          continue; // try next provider
        }

        return response;
      } catch (error) {
        console.warn(`[AI Provider] ${providerType} failed:`, error);
        continue;
      }
    }

    throw new Error('All AI providers failed');
  }
}

export const aiRouter = new AIProviderRouter();
