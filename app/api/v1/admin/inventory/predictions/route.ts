import { NextRequest, NextResponse } from "next/server";
import {
  getInventorySummary,
  getLowStockPredictions,
  predictInventory,
} from "@/lib/analytics/services/predictiveInventory";
import { cacheAside } from "@/lib/backend/cache/redis-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "summary";
    const productId = searchParams.get("productId");

    switch (mode) {
      case "summary": {
        const summary = await cacheAside(
          "inventory:summary",
          () => getInventorySummary(),
          { ttl: 300, keyPrefix: "alaya" } // 5 min cache
        );
        return NextResponse.json({ success: true, data: summary });
      }

      case "low-stock": {
        const predictions = await cacheAside(
          "inventory:low-stock",
          () => getLowStockPredictions(),
          { ttl: 300, keyPrefix: "alaya" } // 5 min cache
        );
        return NextResponse.json({ success: true, data: predictions });
      }

      case "single": {
        if (!productId) {
          return NextResponse.json(
            { success: false, error: { code: "VALIDATION_ERROR", message: "productId is required" } },
            { status: 400 }
          );
        }
        const prediction = await cacheAside(
          `inventory:single:${productId}`,
          () => predictInventory(productId),
          { ttl: 120, keyPrefix: "alaya" } // 2 min cache per product
        );
        return NextResponse.json({ success: true, data: prediction });
      }

      default:
        return NextResponse.json(
          { success: false, error: { code: "INVALID_MODE", message: "Mode must be: summary, low-stock, or single" } },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "PREDICTION_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
