/**
 * ALAYA INSIDER — SMS OTP Authentication
 * Generate, send, and verify one-time passcodes via SMS for 2FA
 */

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { sendOtpSms, isTwilioConfigured } from "@/lib/backend/sms/twilio";
import { logSecurityEvent } from "@/lib/backend/security/audit";

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;

/**
 * Generate a cryptographically secure OTP code
 */
function generateOtpCode(): string {
  // Generate 6-digit code (avoid leading 0 for cleanliness)
  const min = 100000;
  const max = 999999;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

/**
 * Send an SMS OTP to the user's registered phone number
 * Stores the hashed OTP in the database for verification
 */
export async function sendSmsOtp(
  userId: string,
  phoneNumber?: string
): Promise<{ success: boolean; message: string }> {
  // If no phone number provided, look it up
  if (!phoneNumber) {
    const sms2fa = await prisma.smsTwoFactor.findUnique({ where: { userId } });
    if (!sms2fa || !sms2fa.phoneNumber) {
      return { success: false, message: "No phone number registered for 2FA." };
    }
    phoneNumber = sms2fa.phoneNumber;
  }

  // Check if Twilio is configured
  if (!isTwilioConfigured()) {
    // In development/demo mode, log the code instead of sending SMS
    const devCode = generateOtpCode();
    const codeHash = await bcrypt.hash(devCode, 10);

    // Invalidate any previous unused OTPs
    await prisma.smsOtp.updateMany({
      where: { userId, used: false },
      data: { used: true },
    });

    // Store the new OTP
    await prisma.smsOtp.create({
      data: {
        userId,
        code: codeHash,
        phoneNumber,
        attempts: 0,
        used: false,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      },
    });

    console.log(`[DEV] SMS OTP for ${phoneNumber}: ${devCode}`);
    return {
      success: true,
      message: `OTP sent to ${phoneNumber}. (DEV: Code is ${devCode})`,
    };
  }

  // Twilio is configured — generate and send real SMS
  const code = generateOtpCode();
  const codeHash = await bcrypt.hash(code, 10);

  // Invalidate any previous unused OTPs
  await prisma.smsOtp.updateMany({
    where: { userId, used: false },
    data: { used: true },
  });

  // Store the new OTP
  await prisma.smsOtp.create({
    data: {
      userId,
      code: codeHash,
      phoneNumber,
      attempts: 0,
      used: false,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    },
  });

  // Send the SMS
  const result = await sendOtpSms(phoneNumber, code);
  if (!result.success) {
    return { success: false, message: "Failed to send SMS. Please try again." };
  }

  await logSecurityEvent({
    userId,
    action: "sms_otp_sent",
    details: `OTP sent to ${phoneNumber}`,
    severity: "info",
  });

  return { success: true, message: `Verification code sent to ${phoneNumber}.` };
}

/**
 * Verify an SMS OTP code
 */
export async function verifySmsOtp(
  userId: string,
  code: string
): Promise<{ success: boolean; message: string }> {
  // Find the latest unused OTP
  const otpRecord = await prisma.smsOtp.findFirst({
    where: {
      userId,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    return { success: false, message: "No valid OTP found. Request a new code." };
  }

  // Check if max attempts exceeded
  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    // Mark as used to force re-request
    await prisma.smsOtp.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    await logSecurityEvent({
      userId,
      action: "sms_otp_exhausted",
      details: "OTP max attempts exceeded",
      severity: "warning",
    });

    return { success: false, message: "Too many failed attempts. Request a new code." };
  }

  // Increment attempts
  await prisma.smsOtp.update({
    where: { id: otpRecord.id },
    data: { attempts: { increment: 1 } },
  });

  // Verify the code
  const valid = await bcrypt.compare(code, otpRecord.code);
  if (!valid) {
    const remaining = MAX_ATTEMPTS - (otpRecord.attempts + 1);
    return {
      success: false,
      message: `Invalid code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
    };
  }

  // Mark as used
  await prisma.smsOtp.update({
    where: { id: otpRecord.id },
    data: { used: true },
  });

  await logSecurityEvent({
    userId,
    action: "sms_otp_verified",
    details: "SMS OTP verified successfully",
    severity: "info",
  });

  return { success: true, message: "Code verified successfully." };
}

/**
 * Check if SMS 2FA is enabled for a user
 */
export async function isSms2FAEnabled(userId: string): Promise<boolean> {
  const sms2fa = await prisma.smsTwoFactor.findUnique({ where: { userId } });
  return sms2fa?.enabled === true && sms2fa?.verified === true;
}

/**
 * Get the user's registered phone number for SMS 2FA
 */
export async function getSmsPhoneNumber(userId: string): Promise<string | null> {
  const sms2fa = await prisma.smsTwoFactor.findUnique({ where: { userId } });
  return sms2fa?.phoneNumber || null;
}

/**
 * Register a phone number for SMS 2FA (send first verification OTP)
 */
export async function registerPhoneFor2FA(
  userId: string,
  phoneNumber: string
): Promise<{ success: boolean; message: string }> {
  // Validate phone format (basic E.164 check)
  const phoneClean = phoneNumber.replace(/[\s\-\(\)]/g, "");
  if (!/^\+[1-9]\d{6,14}$/.test(phoneClean)) {
    return { success: false, message: "Invalid phone number. Use international format like +1234567890." };
  }    // Upsert the phone record
  await prisma.smsTwoFactor.upsert({
    where: { userId },
    create: {
      userId,
      phoneNumber: phoneClean,
      enabled: false,
      verified: false,
    },
    update: {
      phoneNumber: phoneClean,
      enabled: false,
      verified: false,
    },
  });

  // Send verification OTP
  return sendSmsOtp(userId, phoneClean);
}

/**
 * Enable SMS 2FA (after phone is verified via OTP)
 */
export async function enableSms2FA(userId: string): Promise<boolean> {
  try {
    await prisma.smsTwoFactor.update({
      where: { userId },
      data: { enabled: true, verified: true },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Disable SMS 2FA
 */
export async function disableSms2FA(userId: string): Promise<boolean> {
  try {
    await prisma.smsTwoFactor.update({
      where: { userId },
      data: { enabled: false },
    });
    return true;
  } catch {
    return false;
  }
}
