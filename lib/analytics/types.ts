/**
 * ALAYA INSIDER — Analytics + Revenue Intelligence + BI (Phase 10)
 * Comprehensive types for a Stripe/Netflix/Amplitude-grade analytics platform.
 * Event-driven, attribution-aware, forecasting-ready.
 */

export type EventName =
  | 'page.view'
  | 'product.view'
  | 'article.view'
  | 'affiliate.click'
  | 'affiliate.conversion'
  | 'revenue.attributed'
  | 'search.query'
  | 'search.click'
  | 'recommendation.click'
  | 'recommendation.conversion'
  | 'ai.task.executed'
  | 'ai.cost.incurred'
  | 'user.session'
  | 'user.bookmark'
  | 'user.favorite'
  | 'user.saved_search'
  | 'workflow.completed'
  | 'queue.job.completed'
  | 'email.sent'
  | 'error.occurred'
  | 'performance.metric';

export interface AnalyticsEvent {
  id: string;
  name: EventName;
  userId?: string;
  sessionId?: string;
  entityType?: string;
  entityId?: string;
  properties: Record<string, any>;
  timestamp: Date;
  source: 'web' | 'admin' | 'worker' | 'api' | 'system';
  referrer?: string;
  userAgent?: string;
  ip?: string;
  revenue?: number;
  commission?: number;
  currency?: string;
  network?: string;
}

export interface AttributionModel {
  type: 'last_click' | 'first_click' | 'linear' | 'time_decay' | 'position_based';
  windowDays: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  totalCommission: number;
  orderCount: number;
  avgOrderValue: number;
  commissionRate: number;
  byNetwork: Record<string, { revenue: number; commission: number; orders: number; epc: number }>;
  byProduct: Array<{ productId: string; revenue: number; commission: number }>;
  byBrand: Array<{ brandId: string; revenue: number; commission: number }>;
  byUniverse: Array<{ universe: string; revenue: number; commission: number }>;
}

export interface UserAnalytics {
  dau: number;
  wau: number;
  mau: number;
  retention: {
    day1: number;
    day7: number;
    day30: number;
  };
  cohorts: Array<{
    cohort: string;
    users: number;
    revenue: number;
    ltv: number;
  }>;
  segments: Record<string, number>;
  avgSessionDuration: number;
  pagesPerSession: number;
  bookmarkRate: number;
  favoriteRate: number;
}

export interface ContentAnalytics {
  topArticles: Array<{ id: string; title: string; views: number; avgReadTime: number; revenue: number }>;
  scrollDepth: Record<string, number>;
  ctrByArticle: Record<string, number>;
  decayScores: Array<{ id: string; score: number }>;
  internalLinkCTR: number;
}

export interface SearchAnalytics {
  totalQueries: number;
  uniqueQueries: number;
  ctr: number;
  noResultRate: number;
  topQueries: Array<{ query: string; count: number; ctr: number }>;
  funnel: {
    impressions: number;
    clicks: number;
    conversions: number;
  };
}

export interface RecommendationAnalytics {
  overallCTR: number;
  revenueAttributed: number;
  topModules: Array<{ module: string; ctr: number; revenue: number }>;
  lowPerformers: string[];
  graphHealth: number;
}

export interface AffiliateIntelligence {
  totalRevenue: number;
  totalCommission: number;
  byNetwork: Record<string, {
    revenue: number;
    commission: number;
    clicks: number;
    conversions: number;
    epc: number;
    roi: number;
    healthScore: number;
  }>;
  topProducts: Array<{ productId: string; network: string; revenue: number; commission: number }>;
  brokenLinks: number;
  opportunities: string[];
}

export interface AIAnalytics {
  totalTasks: number;
  totalTokens: number;
  totalCostUsd: number;
  successRate: number;
  avgLatencyMs: number;
  byAgent: Record<string, { tasks: number; cost: number; successRate: number }>;
  byProvider: Record<string, { tokens: number; cost: number }>;
  costTrend: number;
}

export interface FunnelStep {
  name: string;
  count: number;
  conversionRate: number;
}

export interface Cohort {
  period: string;
  size: number;
  retention: number[];
  revenue: number[];
}

export interface AlertRule {
  id: string;
  metric: string;
  threshold: number;
  operator: 'lt' | 'gt' | 'eq';
  window: string;
  channels: ('email' | 'slack' | 'inapp')[];
  enabled: boolean;
}

export interface Forecast {
  metric: string;
  current: number;
  predicted: number;
  confidence: number;
  horizonDays: number;
  model: string;
}
