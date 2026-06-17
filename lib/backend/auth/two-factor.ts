/**
 * ALAYA INSIDER — Two-Factor Authentication (TOTP)
 * Enterprise-grade 2FA using TOTP (RFC 6238) via otplib
 */

import { TOTP } from "otplib";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { generateBackupCodes } from "@/lib/backend/auth/password";

// Configure TOTP instance
const totp = new TOTP();
// Configure via create function for custom options
const totpVerify = totp.verify.bind(totp);

const APP_NAME = "ALAYA INSIDER";

/**
 * Generate a new TOTP secret and QR code for setup
 */
export async function generateTOTPSecret(userId: string, email: string) {
  const secret = totp.generateSecret();
  
  // Generate the otpauth URI for QR code
  const otpauth = `otpauth://totp/${encodeURIComponent(APP_NAME)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(APP_NAME)}&algorithm=SHA1&digits=6&period=30`;
  
  // Generate QR code as data URL
  const qrCode = await QRCode.toDataURL(otpauth);
  
  // Upsert the 2FA record
  await prisma.twoFactorAuth.upsert({
    where: { userId },
    create: { userId, secret, enabled: false, verified: false },
    update: { secret, enabled: false, verified: false },
  });

  return { secret, qrCode, otpauth };
}

/**
 * Verify a TOTP token against the user's stored secret
 */
export async function verifyTOTP(userId: string, token: string): Promise<boolean> {
  const tfa = await prisma.twoFactorAuth.findUnique({ where: { userId } });
  if (!tfa) return false;
  
  try {
    const result = await totpVerify(token, { secret: tfa.secret });
    return !!result;
  } catch {
    return false;
  }
}

/**
 * Enable 2FA after successful verification
 */
export async function enable2FA(userId: string): Promise<boolean> {
  try {
    await prisma.twoFactorAuth.update({
      where: { userId },
      data: { enabled: true, verified: true },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Disable 2FA
 */
export async function disable2FA(userId: string): Promise<boolean> {
  try {
    await prisma.twoFactorAuth.update({
      where: { userId },
      data: { enabled: false, verified: false },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate backup codes for account recovery
 * Returns the plaintext codes (display once to user) and stores hashed versions
 */
export async function generateAndStoreBackupCodes(userId: string): Promise<string[]> {
  const plainCodes = generateBackupCodes(10);
  
  // Hash and store each code
  for (const code of plainCodes) {
    const codeHash = await bcrypt.hash(code, 10);
    await prisma.backupCode.create({
      data: { userId, codeHash },
    });
  }
  
  return plainCodes;
}

/**
 * Verify a backup code
 * Returns true if valid, marks as used
 */
export async function verifyBackupCode(userId: string, code: string): Promise<boolean> {
  const codes = await prisma.backupCode.findMany({
    where: { userId, used: false },
  });

  for (const stored of codes) {
    if (await bcrypt.compare(code, stored.codeHash)) {
      await prisma.backupCode.update({
        where: { id: stored.id },
        data: { used: true, usedAt: new Date() },
      });
      return true;
    }
  }
  return false;
}

/**
 * Check if a user has 2FA enabled
 */
export async function is2FAEnabled(userId: string): Promise<boolean> {
  const tfa = await prisma.twoFactorAuth.findUnique({ where: { userId } });
  return tfa?.enabled === true;
}

/**
 * Get remaining backup codes count
 */
export async function getBackupCodesCount(userId: string): Promise<number> {
  return prisma.backupCode.count({
    where: { userId, used: false },
  });
}
