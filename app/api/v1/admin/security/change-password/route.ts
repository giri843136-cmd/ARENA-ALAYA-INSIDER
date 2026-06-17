/**
 * ALAYA INSIDER — Password Change API
 * Allows authenticated users to change their password.
 * Enforces: current password verification, new password strength, force logout on change.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth/auth";
import { hashPassword, verifyPassword, validatePasswordStrength } from "@/lib/backend/auth/password";
import { logSecurityEvent } from "@/lib/backend/security/audit";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/backend/security/rate-limiter";
import { csrfMiddleware } from "@/lib/backend/security/csrf";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateCheck = await checkRateLimit(identifier, "auth");
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Try again later." } },
        { status: 429, headers: { "Retry-After": String(rateCheck.reset) } }
      );
    }

    // CSRF check
    const csrfError = await csrfMiddleware(request);
    if (csrfError) return csrfError;

    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "You must be signed in to change your password." } },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION", message: "Current password and new password are required." } },
        { status: 400 }
      );
    }

    // Validate new password strength
    const strengthCheck = validatePasswordStrength(newPassword);
    if (!strengthCheck.valid) {
      return NextResponse.json(
        { success: false, error: { code: "WEAK_PASSWORD", message: strengthCheck.message } },
        { status: 400 }
      );
    }

    // Get user's current password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User not found." } },
        { status: 404 }
      );
    }

    // Raw query to get passwordHash (not in Prisma types yet)
    const result = await prisma.$queryRawUnsafe<Array<{ passwordHash: string | null }>>(
      `SELECT "passwordHash" FROM "User" WHERE id = $1`,
      userId
    );

    const currentHash = result[0]?.passwordHash;

    if (!currentHash) {
      // No password set yet — this is first-time setup
      // Allow setting password without current password verification
      const newHash = await hashPassword(newPassword);
      await prisma.$executeRawUnsafe(
        `UPDATE "User" SET "passwordHash" = $1 WHERE id = $2`,
        newHash,
        userId
      );

      await logSecurityEvent({
        userId,
        action: "password_initial_set",
        details: "First-time password set after login",
        severity: "info",
      });

      return NextResponse.json({
        success: true,
        data: { message: "Password set successfully. Please sign in with your new password." },
      });
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, currentHash);
    if (!isValid) {
      await logSecurityEvent({
        userId,
        action: "password_change_failed",
        details: "Current password verification failed",
        severity: "warning",
      });

      return NextResponse.json(
        { success: false, error: { code: "INVALID_PASSWORD", message: "Current password is incorrect." } },
        { status: 400 }
      );
    }

    // Hash and update new password
    const newHash = await hashPassword(newPassword);
    await prisma.$executeRawUnsafe(
      `UPDATE "User" SET "passwordHash" = $1 WHERE id = $2`,
      newHash,
      userId
    );

    // Log the change
    await logSecurityEvent({
      userId,
      action: "password_changed",
      details: "Password changed successfully",
      severity: "info",
    });

    return NextResponse.json({
      success: true,
      data: { message: "Password changed successfully. For security, please sign in again." },
    });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL", message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}
