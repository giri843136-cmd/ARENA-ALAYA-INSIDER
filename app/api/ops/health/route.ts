/**
 * ALAYA INSIDER - Health Check Endpoint (used by CI/CD, load balancers, monitoring)
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getRedis } from "@/lib/search/redis/client";
import { getTypesenseClient } from "@/lib/search/typesense/client";

export async function GET() {
  const checks: Record<string, any> = {
    timestamp: new Date().toISOString(),
    status: "healthy",
  };

  try {
    // Database (graceful - uses build-safe stub if no DB)
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch (e: any) {
    checks.database = { status: "error", message: e.message?.slice(0, 120) };
    checks.status = "degraded";
  }

  try {
    // Redis
    const redis = getRedis();
    await redis.ping();
    checks.redis = "ok";
  } catch (e: any) {
    checks.redis = { status: "error", message: "Redis unavailable - queues/cache degraded" };
    checks.status = "degraded";
  }

  try {
    // Typesense
    const tsHealth = await (await import("@/lib/search/typesense/client")).healthCheck?.();
    if (tsHealth?.healthy) {
      checks.typesense = "ok";
    } else {
      checks.typesense = { status: "error", message: tsHealth?.error || "Typesense unreachable - search degraded" };
      checks.status = "degraded";
    }
  } catch {
    checks.typesense = { status: "error", message: "Typesense client error - search degraded" };
    checks.status = "degraded";
  }

  // Add more: queue depth, AI provider health, affiliate link health, etc.

  const statusCode = checks.status === "healthy" ? 200 : 503;
  return NextResponse.json(checks, { status: statusCode });
}
