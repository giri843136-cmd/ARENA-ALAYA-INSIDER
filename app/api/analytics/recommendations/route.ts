import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    overallCTR: 0.34,
    revenueAttributed: 124890,
    topModules: [
      { module: "related_products", ctr: 0.41, revenue: 48200 },
      { module: "for_you", ctr: 0.29, revenue: 31200 },
    ],
    graphHealth: 0.94,
  });
}
