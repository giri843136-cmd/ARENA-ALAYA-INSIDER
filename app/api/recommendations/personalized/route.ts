import { NextRequest, NextResponse } from 'next/server';
import { recommendationService } from '@/lib/recommendations/services/recommendationService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const limit = parseInt(searchParams.get('limit') || '16');

  if (!userId) {
    return NextResponse.json({ error: 'userId required for personalized recommendations' }, { status: 400 });
  }

  const recs = await recommendationService.getPersonalizedRecommendations({ userId, limit });

  return NextResponse.json({
    recommendations: recs,
    count: recs.length,
    personalized: true,
  });
}
