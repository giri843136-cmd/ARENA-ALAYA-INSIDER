/**
 * Revenue Intelligence API (safe surface for frozen admin)
 */

import { NextRequest, NextResponse } from "next/server";
import { revenueIntelligence } from "@/lib/analytics/services/revenueIntelligence";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "30");
  const start = new Date(Date.now() - days * 86400000);
  const end = new Date();

  const metrics = await revenueIntelligence.getRevenueMetrics(start, end);
  const forecast = await revenueIntelligence.getRevenueForecast(30);

  return NextResponse.json({ metrics, forecast });
}
