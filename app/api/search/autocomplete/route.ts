import { NextRequest, NextResponse } from 'next/server';
import { autocomplete } from '@/lib/search/services/searchService';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  const suggestions = await autocomplete(q);
  return NextResponse.json({ suggestions });
}
