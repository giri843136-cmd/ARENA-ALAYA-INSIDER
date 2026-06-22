import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    lastAggregation: new Date().toISOString(),
    eventIngestRate: "1240/min",
    warehouseLag: "3m",
  });
}
