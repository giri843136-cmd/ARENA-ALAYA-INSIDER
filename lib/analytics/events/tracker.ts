/**
 * ALAYA INSIDER — Central Event Tracker
 * Captures every important interaction. Writes to Postgres (raw events) + Redis (real-time) + prepares for warehouse.
 */

import { prisma } from "@/lib/db/prisma";
import { getRedis } from "@/lib/search/redis/client";
import { AnalyticsEvent } from "../types";
import { publishEvent } from "@/lib/backend/events/eventBus";

const redis = getRedis();

export async function trackEvent(event: any) { // permissive for all event names used in platform (strict types in lib/ai/types)
  const fullEvent: AnalyticsEvent = {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    timestamp: new Date(),
  };

  // 1. Persist to Postgres (source of truth for analytics)
  await prisma.analyticsEvent.create({
    data: {
      id: fullEvent.id,
      name: fullEvent.name,
      userId: fullEvent.userId,
      sessionId: fullEvent.sessionId,
      entityType: fullEvent.entityType,
      entityId: fullEvent.entityId,
      properties: fullEvent.properties as any,
      timestamp: fullEvent.timestamp,
      source: fullEvent.source,
      referrer: fullEvent.referrer,
      userAgent: fullEvent.userAgent,
      revenue: fullEvent.revenue,
      commission: fullEvent.commission,
      currency: fullEvent.currency,
      network: fullEvent.network,
    },
  }).catch(() => {}); // Never block on analytics

  // 2. Real-time signals in Redis
  await redis.zincrby(`analytics:realtime:${fullEvent.name}`, 1, fullEvent.entityId || fullEvent.properties.query || "global");
  if (fullEvent.revenue) {
    await redis.incrbyfloat("analytics:realtime:revenue", fullEvent.revenue);
  }

  // 3. Publish to main event bus so other systems (recommendations, AI, etc.) can react
  await publishEvent("analytics.event" as any, {
    name: fullEvent.name as any,
    entityId: fullEvent.entityId,
    revenue: fullEvent.revenue,
  });

  return fullEvent.id;
}

// Convenience helpers
export const analytics = {
  trackPageView: (path: string, userId?: string) =>
    trackEvent({ name: "page.view", properties: { path }, userId, source: "web" }),

  trackProductView: (productId: string, userId?: string) =>
    trackEvent({ name: "product.view", entityType: "product", entityId: productId, userId, source: "web" }),

  trackAffiliateClick: (productId: string, network: string, userId?: string) =>
    trackEvent({
      name: "affiliate.click",
      entityType: "product",
      entityId: productId,
      properties: { network },
      userId,
      source: "web",
    }),

  trackRevenue: (amount: number, commission: number, network: string, productId: string, userId?: string) =>
    trackEvent({
      name: "revenue.attributed",
      entityType: "product",
      entityId: productId,
      revenue: amount,
      commission,
      network,
      currency: "USD",
      userId,
      source: "system",
    }),

  trackSearch: (query: string, resultCount: number, userId?: string) =>
    trackEvent({
      name: "search.query",
      properties: { query, resultCount },
      userId,
      source: "web",
    }),

  trackAIUsage: (agent: string, tokens: number, cost: number, userId?: string) =>
    trackEvent({
      name: "ai.task.executed",
      properties: { agent, tokens, cost },
      userId,
      source: "system",
    }),
};
