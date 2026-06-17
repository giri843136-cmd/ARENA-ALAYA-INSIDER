/**
 * ALAYA INSIDER — Delegated Access API
 * Allows the primary admin to grant/revoke/list delegated access for other users.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth/auth";
import { grantAccess, revokeAccess, listDelegatedAccess, isPrimaryAdmin } from "@/lib/backend/auth/delegated-access";
import { logSecurityEvent } from "@/lib/backend/security/audit";
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
    const userEmail = session.user.email || "";

    // Only primary admin can list delegated access
    if (!isPrimaryAdmin(userEmail)) {
      // Non-primary admins can see their own delegated access status
      const access = await prisma.delegatedAccess.findFirst({
        where: { grantedTo: userId, active: true },
      });
      return NextResponse.json({
        success: true,
        data: {
          isDelegated: !!access,
          delegatedRole: access?.role || null,
        },
      });
    }

    const accessRecords = await listDelegatedAccess(userId);
    return NextResponse.json({ success: true, data: accessRecords });
  } catch (error) {
    console.error("Delegated access list error:", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rlId = getRateLimitIdentifier(request);
    const rl = await checkRateLimit(rlId, "auth");
    if (!rl.allowed) return NextResponse.json({ success: false, error: { code: "RATE_LIMITED" } }, { status: 429 });

    const csrfError = await csrfMiddleware(request);
    if (csrfError) return csrfError;
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED" } }, { status: 401 });
    }

    const granterUserId = (session.user as any).id;
    const body = await request.json();
    const { action, email, role, permissions, expiresAt, accessId } = body;

    switch (action) {
      case "grant": {
        if (!email) {
          return NextResponse.json({ success: false, error: { code: "VALIDATION", message: "Email is required." } }, { status: 400 });
        }

        const access = await grantAccess(
          granterUserId,
          email,
          role || "EDITOR",
          permissions || [],
          expiresAt ? new Date(expiresAt) : undefined
        );

        await logSecurityEvent({
          userId: granterUserId,
          action: "access_granted",
          details: `Granted ${role || "EDITOR"} access to ${email}`,
          severity: "info",
        });

        return NextResponse.json({ success: true, data: access });
      }

      case "revoke": {
        if (!accessId) {
          return NextResponse.json({ success: false, error: { code: "VALIDATION", message: "Access ID is required." } }, { status: 400 });
        }

        const result = await revokeAccess(accessId, granterUserId);

        await logSecurityEvent({
          userId: granterUserId,
          action: "access_revoked",
          details: `Revoked access for ${result.email}`,
          severity: "warning",
        });

        return NextResponse.json({ success: true, data: result });
      }

      default:
        return NextResponse.json({ success: false, error: { code: "INVALID_ACTION" } }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "ERROR", message: error.message } }, { status: 400 });
  }
}
