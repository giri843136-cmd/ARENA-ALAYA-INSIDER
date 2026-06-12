import { NextResponse } from 'next/server';
import { getAIAnalytics } from '@/lib/ai/analytics/tracker';

export async function GET() {
  const analytics = await getAIAnalytics();
  return NextResponse.json(analytics);
}
