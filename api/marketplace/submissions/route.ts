/**
 * ALAYA INSIDER — Marketplace Partner Submission API
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Validate partner key, create submission, trigger review workflow in Admin (frozen)
  return NextResponse.json({ submissionId: 'sub_abc123', status: 'under_review' });
}
