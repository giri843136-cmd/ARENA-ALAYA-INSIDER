/**
 * ALAYA INSIDER — Revenue Forecast API
 * Returns projected revenue data for the admin dashboard widget
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth/auth";
import { forecastRevenue, getForecastTimeSeries } from "@/lib/analytics/services/revenueForecasting";
import { logSecurityEvent } from "@/lib/backend/security/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED" } }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const historicalDays = parseInt(searchParams.get("historicalDays") || "90");
    const forecastDays = parseInt(searchParams.get("forecastDays") || "30");

    // Run forecast and time series in parallel
    const [forecast, timeSeries] = await Promise.all([
      forecastRevenue({ historicalDays, forecastDays, confidenceLevel: 0.80 }),
      getForecastTimeSeries({ historicalDays, forecastDays }),
    ]);

    // Log access for audit
    await logSecurityEvent({
      userId: session.user.id,
      action: "revenue_forecast_viewed",
      details: `Revenue forecast viewed: ${forecastDays}d forecast based on ${historicalDays}d history`,
      severity: "info",
    });

    return NextResponse.json({
      success: true,
      data: {
        forecast,
        timeSeries,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[RevenueForecast] API error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL", message: "Failed to generate revenue forecast" } },
      { status: 500 }
    );
  }
}
