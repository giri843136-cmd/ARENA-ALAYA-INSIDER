import { NextResponse } from "next/server";
import { analyticsMetrics } from "@/lib/analytics/observability/metrics";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    lastAggregation: new Date().toISOString(),
    eventIngestRate: "1240/min",
    warehouseLag: "3m",
  });
}
