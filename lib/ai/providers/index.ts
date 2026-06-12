import { aiRouter } from './base';
import { AnthropicProvider } from './anthropic';
import { MockProvider } from './mock';

// Register providers (order matters for fallback)
aiRouter.register(new AnthropicProvider());
aiRouter.register(new MockProvider());

export { aiRouter };
export * from './base';
