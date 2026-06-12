/**
 * ALAYA INSIDER — Queue Dashboard (Bull Board)
 * Protected admin-only queue monitoring
 */
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/backend/auth/auth';

// Bull Board is optional in this build for production readiness.
// The /admin/queues page calls this endpoint and shows a safe UI.
// Full Bull Board can be mounted in a separate Express app if needed.
export async function GET(req: Request) {
  const user = await requireAuth();
  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes((user as any).role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  return NextResponse.json({
    message: 'Bull Board / Queue monitoring available',
    queues: ['ai-tasks', 'recommendations', 'publishing', 'email', 'search-sync', 'affiliate'],
    note: 'Full UI can be enabled by mounting @bull-board in production.',
  });
}
