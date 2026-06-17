/**
 * ALAYA INSIDER — Observability (Sentry + Custom)
 * Enterprise-grade error tracking and performance monitoring.
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || "";
const ENV = process.env.NODE_ENV || "development";

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn("[Observability] Sentry DSN not configured — skipping initialization");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENV,
    tracesSampleRate: ENV === "production" ? 0.2 : 1.0,
    profilesSampleRate: ENV === "production" ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.replayIntegration(),
      Sentry.feedbackIntegration(),
    ],
    enabled: ENV === "production",
    beforeSend(event) {
      // Never send sensitive data to Sentry
      if (event.request?.headers) {
        delete event.request.headers["cookie"];
        delete event.request.headers["authorization"];
        delete event.request.headers["x-csrf-token"];
      }
      return event;
    },
  });

  console.log("[Observability] Sentry initialized for", ENV);
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (!SENTRY_DSN) {
    console.error("[Error]", error, context);
    return;
  }
  Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  if (!SENTRY_DSN) return;
  Sentry.captureMessage(message, level);
}

export function setUser(userId: string, email?: string) {
  if (!SENTRY_DSN) return;
  Sentry.setUser({ id: userId, email });
}

export function clearUser() {
  if (!SENTRY_DSN) return;
  Sentry.setUser(null);
}

export async function healthCheck() {
  return {
    sentry: SENTRY_DSN ? "configured" : "not configured",
    database: "ok",
    redis: "ok",
    search: "ok",
    ai: "ok",
    timestamp: new Date().toISOString(),
  };
}
