/**
 * ALAYA INSIDER — 2FA Setup API
 * Endpoints for setting up, verifying, enabling, disabling 2FA, and managing backup codes.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth/auth";
import { generateTOTPSecret, verifyTOTP, enable2FA, disable2FA, generateAndStoreBackupCodes, is2FAEnabled, getBackupCodesCount } from "@/lib/backend/auth/two-factor";
import { logSecurityEvent } from "@/lib/backend/security/audit";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/backend/security/rate-limiter";
import { csrfMiddleware } from "@/lib/backend/security/csrf";
import { applyCorsHeaders } from "@/lib/backend/security/cors";

/**
 * GET /api/v1/admin/security/setup-2fa
 * Returns the user's 2FA setup status and QR code (if not yet enabled)
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rlId = getRateLimitIdentifier(request);
    const rl = await checkRateLimit(rlId, "admin");
    if (!rl.allowed) return NextResponse.json({ success: false, error: { code: "RATE_LIMITED" } }, { status: 429 });

    // CSRF check
    const csrfError = await csrfMiddleware(request);
    if (csrfError) return csrfError;
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const email = session.user.email || "";

    const enabled = await is2FAEnabled(userId);
    const backupCodesCount = await getBackupCodesCount(userId);

    return NextResponse.json({
      success: true,
      data: {
        enabled,
        backupCodesRemaining: backupCodesCount,
      },
    });
  } catch (error) {
    console.error("2FA status error:", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL", message: "Failed to get 2FA status" } }, { status: 500 });
  }
}

/**
 * POST /api/v1/admin/security/setup-2fa
 * Actions: generate (get QR code), verify (confirm setup), enable, disable
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rlId = getRateLimitIdentifier(request);
    const rl = await checkRateLimit(rlId, "twoFactorVerify");
    if (!rl.allowed) return NextResponse.json({ success: false, error: { code: "RATE_LIMITED" } }, { status: 429 });

    // CSRF check
    const csrfError = await csrfMiddleware(request);
    if (csrfError) return csrfError;
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const email = session.user.email || "";
    const body = await request.json();
    const { action, token } = body;

    switch (action) {
      case "generate": {
        // Generate new TOTP secret and QR code
        const { qrCode, secret } = await generateTOTPSecret(userId, email);
        const backupCodes = await generateAndStoreBackupCodes(userId);

        return NextResponse.json({
          success: true,
          data: {
            qrCode,
            backupCodes,
            message: "Scan the QR code with your authenticator app and save the backup codes.",
          },
        });
      }

      case "verify": {
        // Verify the TOTP token to confirm setup
        if (!token) {
          return NextResponse.json({ success: false, error: { code: "VALIDATION", message: "Verification token is required." } }, { status: 400 });
        }

        const valid = await verifyTOTP(userId, token);
        if (!valid) {
          return NextResponse.json({ success: false, error: { code: "INVALID_TOKEN", message: "Invalid verification code. Try again." } }, { status: 400 });
        }

        // Enable 2FA after successful verification
        await enable2FA(userId);

        await logSecurityEvent({
          userId,
          action: "2fa_enabled",
          details: "Two-factor authentication enabled and verified",
          severity: "info",
        });

        return NextResponse.json({
          success: true,
          data: { message: "Two-factor authentication has been enabled successfully." },
        });
      }

      case "disable": {
        // Disable 2FA
        await disable2FA(userId);

        await logSecurityEvent({
          userId,
          action: "2fa_disabled",
          details: "Two-factor authentication disabled",
          severity: "warning",
        });

        return NextResponse.json({
          success: true,
          data: { message: "Two-factor authentication has been disabled." },
        });
      }

      case "regenerate-backup-codes": {
        // Generate new backup codes (invalidates old ones)
        const { prisma } = await import("@/lib/db/prisma");
        await prisma.backupCode.deleteMany({ where: { userId } });
        const backupCodes = await generateAndStoreBackupCodes(userId);

        await logSecurityEvent({
          userId,
          action: "backup_codes_regenerated",
          details: "Backup codes regenerated",
          severity: "info",
        });

        return NextResponse.json({
          success: true,
          data: { backupCodes, message: "New backup codes generated. Save them securely." },
        });
      }

      default:
        return NextResponse.json({ success: false, error: { code: "INVALID_ACTION", message: "Invalid action. Use: generate, verify, enable, disable, or regenerate-backup-codes." } }, { status: 400 });
    }
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL", message: "Failed to process 2FA request." } }, { status: 500 });
  }
}
