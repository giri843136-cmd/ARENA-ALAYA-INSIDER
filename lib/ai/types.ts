/**
 * AI Types for ALAYA INSIDER
 * Aligned with Prisma enums and full platform needs.
 */

export type ProviderType = 'anthropic' | 'openai' | 'fallback';

export type AgentType =
  | 'CONTENT_ARCHITECT'
  | 'SEO_STRATEGIST'
  | 'FAQ_GENERATOR'
  | 'COMPARISON_GENERATOR'
  | 'INTERNAL_LINK_ASSISTANT'
  | 'TREND_RADAR'
  | 'OPPORTUNITY_FINDER'
  | 'SCHEMA_BUILDER'
  | 'REVIEW_GENERATOR'
  | 'METADATA_GENERATOR'
  | 'SEMANTIC_KEYWORD'
  | 'IMAGE_ALT'
  | 'CONTENT_REFRESH'
  | 'LINK_AUDITOR'
  | 'KNOWLEDGE_GRAPH_AI'
  | 'BRAND_VOICE_GUARDIAN';

export interface ProviderOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  [key: string]: any;
}

export interface AITask {
  id: string;
  agentType: AgentType;
  input: any;
  priority: 'low' | 'normal' | 'high';
  provider: ProviderType;
  userId?: string;
  version: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  output?: any;
  tokensUsed?: number;
  costUsd?: number;
  executionTimeMs?: number;
  model?: string;
  error?: string;
}

export interface AIResult {
  taskId: string;
  output: string;
  metadata?: any;
  cost?: number;
  model?: string;
}

export interface AgentConfig {
  type: AgentType;
  name: string;
  description: string;
  capabilities: string[];
  defaultProvider: ProviderType | 'mock';
  defaultModel: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  rateLimitPerMinute: number;
  costPer1kTokens: number;
}

export interface MemoryEntry {
  scope: string;
  key: string;
  value: any;
  createdAt?: Date;
}

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
  agentType: AgentType;
}

export type EventName =
  | 'page.view'
  | 'product.view'
  | 'article.view'
  | 'affiliate.click'
  | 'revenue.attributed'
  | 'search.query'
  | 'ai.task.executed'
  | 'analytics.event'
  | 'product.created'
  | 'product.updated'
  | 'product.published'
  | 'product.bulk_status_changed';

export interface AnalyticsEvent {
  id: string;
  name: EventName;
  userId?: string;
  sessionId?: string;
  entityType?: string;
  entityId?: string;
  properties?: Record<string, any>;
  timestamp: Date;
  source?: string;
  referrer?: string;
  userAgent?: string;
  revenue?: number;
  commission?: number;
  currency?: string;
  network?: string;
}