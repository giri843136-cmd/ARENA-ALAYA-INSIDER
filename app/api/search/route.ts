/**
 * ALAYA INSIDER — Main Search API
 * Hybrid, fast, analytics-aware.
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchAll } from '@/lib/search/services/searchService';
import { trackSearchEvent } from '@/lib/search/analytics/tracker';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('perPage') || '24');

  const start = Date.now();
  const results = await searchAll(q, { page, perPage });

  const latency = Date.now() - start;

  // Fire-and-forget analytics
  trackSearchEvent({
    query: q,
    resultCount: results.totalFound,
    latencyMs: latency,
  });

  return NextResponse.json({
    ...results,
    query: q,
    latencyMs: latency,
  });
}
