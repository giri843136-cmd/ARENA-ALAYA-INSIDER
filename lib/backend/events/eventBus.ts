/**
 * ALAYA INSIDER — Event Bus (Redis + In-memory)
 * Platform-wide event system.
 */

import { getRedis } from "@/lib/search/redis/client";

const redis = getRedis();

export type EventName =
  | "product.published"
  | "product.updated"
  | "article.published"
  | "brand.updated"
  | "ai.task.completed"
  | "search.updated"
  | "recommendation.updated"
  | "price.changed"
  | "affiliate.link_changed"
  | "user.updated";

export async function publishEvent(name: EventName, payload: any) {
  const event = {
    name,
    payload,
    timestamp: new Date().toISOString(),
  };

  // Publish to Redis for distributed consumers
  await redis.publish("alaya:events", JSON.stringify(event));

  // Also log for audit
  console.log(`[Event] ${name}`, { id: payload.productId || payload.articleId || "n/a" });
}

export function subscribeToEvents(handler: (event: any) => void) {
  const sub = redis.duplicate();
  sub.subscribe("alaya:events", (err) => {
    if (err) console.error("Redis subscribe error", err);
  });

  sub.on("message", (_channel, message) => {
    try {
      const event = JSON.parse(message);
      handler(event);
    } catch (e) {
      console.error("Failed to parse event", e);
    }
  });

  return () => sub.disconnect();
}
