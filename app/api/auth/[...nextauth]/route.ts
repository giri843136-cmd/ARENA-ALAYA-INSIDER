/**
 * ALAYA INSIDER — NextAuth Route Handler (Catch-all)
 * Serves all auth endpoints: /api/auth/signin, /api/auth/session, etc.
 * Uses dynamic import so auth initialization happens at request time (not build time).
 */

import type { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ nextauth: string[] }> }) {
  const { handlers } = await import("@/lib/backend/auth/auth");
  const resolvedParams = await params;
  return handlers.GET(req, { params: resolvedParams });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ nextauth: string[] }> }) {
  const { handlers } = await import("@/lib/backend/auth/auth");
  const resolvedParams = await params;
  return handlers.POST(req, { params: resolvedParams });
}
