import { NextResponse } from "next/server";

export async function GET() {
  // In real system this would aggregate from analytics_events + Typesense stats
  return NextResponse.json({
    totalQueries: 184920,
    ctr: 0.31,
    noResultRate: 0.07,
    topQueries: [
      { query: "linen bedding", count: 12480, ctr: 0.47 },
      { query: "cashmere sweater", count: 8920, ctr: 0.39 },
    ],
  });
}
