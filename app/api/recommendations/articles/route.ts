import { NextRequest, NextResponse } from 'next/server';
import { recommendationService } from '@/lib/recommendations/services/recommendationService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get('articleId');
  const limit = parseInt(searchParams.get('limit') || '8');

  if (!articleId) {
    return NextResponse.json({ error: 'articleId required' }, { status: 400 });
  }

  const recs = await recommendationService.getArticleRecommendations(articleId, { limit });

  return NextResponse.json({ recommendations: recs });
}
