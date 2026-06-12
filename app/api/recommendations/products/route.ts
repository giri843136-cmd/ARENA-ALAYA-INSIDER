import { NextRequest, NextResponse } from 'next/server';
import { recommendationService } from '@/lib/recommendations/services/recommendationService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const userId = searchParams.get('userId') || undefined;
  const limit = parseInt(searchParams.get('limit') || '12');

  if (!productId) {
    return NextResponse.json({ error: 'productId required' }, { status: 400 });
  }

  const recs = await recommendationService.getProductRecommendations(productId, { userId, limit });

  return NextResponse.json({
    recommendations: recs,
    count: recs.length,
    generatedAt: new Date().toISOString(),
  });
}
