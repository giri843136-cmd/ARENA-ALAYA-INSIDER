/**
 * ALAYA INSIDER — SMS OTP API Route
 * Sends a one-time passcode to the user's registered phone for 2FA login
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendSmsOtp, getSmsPhoneNumber } from "@/lib/backend/auth/sms-otp";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/backend/security/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rlId = getRateLimitIdentifier(request);
    const rl = await checkRateLimit(rlId, "twoFactorVerify");
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Please wait." } },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION", message: "Email is required." } },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      // Don't reveal if user exists or not
      return NextResponse.json({
        success: true,
        data: { message: "If this account exists, a verification code has been sent." },
      });
    }

    // Check if SMS 2FA is enabled for this user
    const sms2fa = await prisma.smsTwoFactor.findUnique({ where: { userId: user.id } });
    if (!sms2fa || !sms2fa.enabled || !sms2fa.verified) {
      return NextResponse.json({
        success: true,
        data: { message: "If this account exists, a verification code has been sent." },
      });
    }

    // Send the OTP
    const result = await sendSmsOtp(user.id, sms2fa.phoneNumber);

    return NextResponse.json({
      success: result.success,
      data: { message: result.message },
      ...(result.success ? {} : { error: { code: "SMS_FAILED", message: result.message } }),
    });
  } catch (error) {
    console.error("SMS OTP send error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL", message: "Failed to send verification code." } },
      { status: 500 }
    );
  }
}
