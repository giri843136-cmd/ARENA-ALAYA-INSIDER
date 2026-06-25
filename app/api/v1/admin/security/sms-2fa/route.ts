/**
 * ALAYA INSIDER — SMS 2FA Setup & Management API
 * Endpoints for registering phone, verifying SMS OTP, enabling/disabling SMS 2FA
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth/auth";
import { 
  sendSmsOtp, 
  verifySmsOtp, 
  registerPhoneFor2FA, 
  enableSms2FA, 
  disableSms2FA, 
  isSms2FAEnabled, 
  getSmsPhoneNumber 
} from "@/lib/backend/auth/sms-otp";
import { logSecurityEvent } from "@/lib/backend/security/audit";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/backend/security/rate-limiter";
import { csrfMiddleware } from "@/lib/backend/security/csrf";

/**
 * GET /api/v1/admin/security/sms-2fa
 * Returns the user's SMS 2FA setup status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const enabled = await isSms2FAEnabled(userId);
    const phoneNumber = await getSmsPhoneNumber(userId);

    return NextResponse.json({
      success: true,
      data: {
        enabled,
        phoneNumber,
        verified: enabled,
      },
    });
  } catch (error) {
    console.error("SMS 2FA status error:", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL", message: "Failed to get SMS 2FA status" } }, { status: 500 });
  }
}

/**
 * POST /api/v1/admin/security/sms-2fa
 * Actions: register-phone, send-otp, verify-otp, enable, disable
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rlId = getRateLimitIdentifier(request);
    const rl = await checkRateLimit(rlId, "twoFactorVerify");
    if (!rl.allowed) {
      return NextResponse.json({ success: false, error: { code: "RATE_LIMITED" } }, { status: 429 });
    }

    // CSRF check
    const csrfError = await csrfMiddleware(request);
    if (csrfError) return csrfError;

    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { action, phoneNumber, code } = body;

    switch (action) {
      case "register-phone": {
        // Register or update phone number and send verification OTP
        if (!phoneNumber) {
          return NextResponse.json({ success: false, error: { code: "VALIDATION", message: "Phone number is required." } }, { status: 400 });
        }

        const result = await registerPhoneFor2FA(userId, phoneNumber);
        if (!result.success) {
          return NextResponse.json({ success: false, error: { code: "INVALID_PHONE", message: result.message } }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          data: { message: result.message },
        });
      }

      case "send-otp": {
        // Send a new OTP to the registered phone
        const result = await sendSmsOtp(userId);
        if (!result.success) {
          return NextResponse.json({ success: false, error: { code: "SMS_FAILED", message: result.message } }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          data: { message: result.message },
        });
      }

      case "verify-otp": {
        // Verify the OTP code and enable SMS 2FA
        if (!code) {
          return NextResponse.json({ success: false, error: { code: "VALIDATION", message: "Verification code is required." } }, { status: 400 });
        }

        const result = await verifySmsOtp(userId, code);
        if (!result.success) {
          return NextResponse.json({ success: false, error: { code: "INVALID_CODE", message: result.message } }, { status: 400 });
        }

        // Enable SMS 2FA after successful verification
        await enableSms2FA(userId);

        await logSecurityEvent({
          userId,
          action: "sms_2fa_enabled",
          details: "SMS-based two-factor authentication enabled",
          severity: "info",
        });

        return NextResponse.json({
          success: true,
          data: { message: "SMS 2FA has been enabled successfully." },
        });
      }

      case "disable": {
        // Disable SMS 2FA
        await disableSms2FA(userId);

        await logSecurityEvent({
          userId,
          action: "sms_2fa_disabled",
          details: "SMS-based two-factor authentication disabled",
          severity: "warning",
        });

        return NextResponse.json({
          success: true,
          data: { message: "SMS 2FA has been disabled." },
        });
      }

      default:
        return NextResponse.json({ success: false, error: { code: "INVALID_ACTION", message: "Invalid action." } }, { status: 400 });
    }
  } catch (error) {
    console.error("SMS 2FA setup error:", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL", message: "Failed to process SMS 2FA request." } }, { status: 500 });
  }
}
