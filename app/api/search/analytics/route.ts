import { NextResponse } from 'next/server';
import { getPopularQueries, getRecentSearches, getNoResultQueries } from '@/lib/search/analytics/tracker';

export async function GET() {
  const [popular, recent, noResults] = await Promise.all([
    getPopularQueries(15),
    getRecentSearches(10),
    getNoResultQueries(),
  ]);

  return NextResponse.json({
    popular,
    recent,
    noResults: Array.from(noResults).slice(0, 20),
  });
}
