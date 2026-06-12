import { NextResponse } from 'next/server';

export async function GET() {
  // In production this would aggregate from ActivityLog + dedicated recommendation_events table
  return NextResponse.json({
    ctr: 0.34,
    revenueAttributed: 124890,
    topModules: [
      { module: 'related_products', ctr: 0.41, revenue: 48200 },
      { module: 'for_you', ctr: 0.29, revenue: 31200 },
    ],
    topRelationships: ['editorial', 'behavioral', 'trending'],
    lastRefreshed: new Date().toISOString(),
  });
}
