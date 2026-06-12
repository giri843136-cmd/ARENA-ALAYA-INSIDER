import { NextResponse } from "next/server";

/**
 * ALAYA INSIDER — Health Check Endpoint
 * Returns system status for load balancers and uptime monitoring.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function checkDependency(name: string, check: () => Promise<boolean>): Promise<{ status: string; error?: string }> {
  try {
    const healthy = await check();
    return { status: healthy ? "healthy" : "unhealthy" };
  } catch (e: any) {
    return { status: "unhealthy", error: e.message };
  }
}

export async function GET() {
  const start = Date.now();

  const checks = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",
    environment: process.env.NODE_ENV || "development",
    dependencies: {
      database: await checkDependency("database", async () => {
        try {
          const { prisma } = await import("@/lib/db/prisma");
          await prisma.$queryRaw`SELECT 1`;
          return true;
        } catch { return false; }
      }),
      redis: await checkDependency("redis", async () => {
        try {
          const { default: Redis } = await import("ioredis");
          const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
          await redis.ping();
          await redis.quit();
          return true;
        } catch { return false; }
      }),
      typesense: await checkDependency("typesense", async () => {
        try {
          // Dynamic import to avoid hard dependency — Typesense may not be installed
          const typesenseModule = await import("typesense");
          const TypesenseClient = typeof typesenseModule.default === "function"
            ? typesenseModule.default
            : (typesenseModule as any).Client || typesenseModule.default;
          const client = new TypesenseClient({
            nodes: [{
              host: process.env.TYPESENSE_HOST || "localhost",
              port: parseInt(process.env.TYPESENSE_PORT || "8108"),
              protocol: process.env.TYPESENSE_PROTOCOL || "http",
            }],
            apiKey: process.env.TYPESENSE_API_KEY || "",
            connectionTimeoutSeconds: 2,
          });
          await client.health.retrieve();
          return true;
        } catch { return false; }
      }),
    },
    uptime: process.uptime(),
    responseTime: Date.now() - start,
  };

  const isHealthy = Object.values(checks.dependencies).every((d) => d.status === "healthy");
  
  return NextResponse.json(checks, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, must-revalidate",
    },
  });
}
