/**
 * ALAYA INSIDER — Password Security Utilities
 * Enterprise-grade password hashing with bcryptjs
 */

import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a plaintext password against a bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a cryptographically secure random password
 */
export function generateSecurePassword(length = 24): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (v) => chars[v % chars.length]).join("");
}

/**
 * Generate backup codes (10 codes, 12 chars each)
 */
export function generateBackupCodes(count = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const array = new Uint32Array(6);
    crypto.getRandomValues(array);
    const code = Array.from(array, (v) => v.toString(36).toUpperCase().slice(0, 2)).join("");
    codes.push(code.slice(0, 12));
  }
  return codes;
}

/**
 * Password strength validation
 * Returns { valid: boolean, message: string }
 */
export function validatePasswordStrength(password: string): { valid: boolean; message: string } {
  if (password.length < 12) {
    return { valid: false, message: "Password must be at least 12 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    return { valid: false, message: "Password must contain at least one special character" };
  }
  return { valid: true, message: "Password strength: strong" };
}
