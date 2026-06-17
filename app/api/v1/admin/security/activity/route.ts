/**
 * ALAYA INSIDER — Security Activity & Audit Log API
 * Returns security events, login attempts, and active sessions.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth/auth";
import { getSecurityEvents, getLoginAttempts } from "@/lib/backend/security/audit";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/backend/security/rate-limiter";
import { csrfMiddleware } from "@/lib/backend/security/csrf";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const rlId = getRateLimitIdentifier(request);
    const rl = await checkRateLimit(rlId, "admin");
    if (!rl.allowed) return NextResponse.json({ success: false, error: { code: "RATE_LIMITED" } }, { status: 429 });

    const csrfError = await csrfMiddleware(request);
    if (csrfError) return csrfError;
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED" } }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "security-events";
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);
    const email = session.user.email || "";

    switch (type) {
      case "security-events": {
        const events = await getSecurityEvents({ userId, limit });
        return NextResponse.json({ success: true, data: events });
      }

      case "all-events": {
        // Super admin can see all events
        const role = (session.user as any).role;
        if (role !== "SUPER_ADMIN") {
          const events = await getSecurityEvents({ userId, limit });
          return NextResponse.json({ success: true, data: events });
        }
        const events = await getSecurityEvents({ limit });
        return NextResponse.json({ success: true, data: events });
      }

      case "login-attempts": {
        const attempts = await getLoginAttempts(email, limit);
        return NextResponse.json({ success: true, data: attempts });
      }

      case "active-sessions": {
        // Get active sessions (device sessions not revoked)
        const sessions = await prisma.deviceSession.findMany({
          where: {
            userId,
            revokedAt: null,
            lastActive: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
          },
          orderBy: { lastActive: "desc" },
          take: limit,
        });
        return NextResponse.json({ success: true, data: sessions });
      }

      default:
        return NextResponse.json({ success: false, error: { code: "INVALID_TYPE" } }, { status: 400 });
    }
  } catch (error) {
    console.error("Activity log error:", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL", message: "Failed to fetch activity data." } }, { status: 500 });
  }
}
