/**
 * Base AI Agent
 */

import { aiRouter } from '../providers';
import { AITask, AgentType, ProviderType } from '../types';
import { getAgentConfig } from './registry';
import { memoryManager } from '../memory/memoryManager';

export abstract class BaseAIAgent {
  abstract readonly type: AgentType;

  async execute(input: Record<string, any>, userId?: string): Promise<AITask> {
    const config = getAgentConfig(this.type);
    const taskId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const provider = (config.defaultProvider === 'mock' ? 'anthropic' : config.defaultProvider) as ProviderType;
    const task: AITask = {
      id: taskId,
      agentType: this.type,
      input,
      status: 'pending',
      priority: 'normal',
      provider,
      createdAt: new Date(),
      version: 1,
      userId,
    };

    try {
      const start = Date.now();
      
      // Inject relevant memory
      const memoryContext = await memoryManager.getRelevantMemory(this.type, input);
      const enhancedPrompt = this.buildPrompt(input, memoryContext, config);

      const response = await aiRouter.generate(enhancedPrompt, {
        model: config.defaultModel,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        systemPrompt: config.systemPrompt,
      });

      (task as any).output = { content: response.content };
      task.status = 'completed';
      (task as any).tokensUsed = response.tokensUsed;
      (task as any).costUsd = response.costUsd;
      (task as any).executionTimeMs = Date.now() - start;
      (task as any).model = response.model;
      (task as any).provider = response.provider;

      // Store in memory for future agents
      await memoryManager.storeMemory({
        scope: 'agent',
        key: `${this.type}:${taskId}`,
        value: { summary: response.content.slice(0, 400), taskId },
      });

      return task;
    } catch (error: any) {
      task.status = 'failed';
      task.error = error.message;
      return task;
    }
  }

  protected abstract buildPrompt(input: any, memory: any, config: any): string;
}
