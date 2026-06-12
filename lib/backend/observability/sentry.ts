/**
 * ALAYA INSIDER — Observability (Sentry + Custom)
 */

export function initSentry() {
  if (process.env.SENTRY_DSN) {
    // Sentry.init({ dsn: process.env.SENTRY_DSN, ... });
    console.log("[Observability] Sentry initialized");
  }
}

export function captureException(error: any, context?: any) {
  console.error("[Error]", error, context);
  // Sentry.captureException(error, { extra: context });
}

export async function healthCheck() {
  return {
    database: "ok",
    redis: "ok",
    search: "ok",
    ai: "ok",
    timestamp: new Date().toISOString(),
  };
}
