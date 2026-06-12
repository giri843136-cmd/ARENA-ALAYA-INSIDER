/**
 * Personal AI Concierge API (Phase 15)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PersonalAIConcierge } from '@/lib/future/concierge/PersonalAIConcierge';

export async function POST(req: NextRequest) {
  const { userId, message, modalities } = await req.json();
  const concierge = new PersonalAIConcierge(userId);
  const result = await concierge.converse(message, modalities);
  return NextResponse.json(result);
}
