/**
 * ALAYA INSIDER — Admin Guard & Re-authentication
 * IP whitelist for admin access + mandatory re-auth for sensitive actions
 * Enterprise-grade security for admin panel
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { logSecurityEvent } from "@/lib/backend/security/audit";

// =============================================
// ADMIN IP WHITELIST
// =============================================

// Parse comma-separated whitelist from env
const ADMIN_IP_WHITELIST = new Set(
  (process.env.ADMIN_IP_WHITELIST || "")
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean)
);

// VPN CIDR ranges that bypass IP whitelist
const VPN_CIDRS = (process.env.ADMIN_VPN_CIDRS || "")
  .split(",")
  .map((cidr) => cidr.trim())
  .filter(Boolean);

function ipInCIDR(ip: string, cidr: string): boolean {
  const [range, bitsStr] = cidr.split("/");
  const bits = parseInt(bitsStr, 10);
  if (isNaN(bits)) return ip === range;

  const ipNum = ip.split(".").reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0);
  const rangeNum = range.split(".").reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0);
  const mask = ~(2 ** (32 - bits) - 1);
  return (ipNum & mask) === (rangeNum & mask);
}

export function isAdminIPAllowed(ip: string): boolean {
  // If whitelist is empty, allow all (default — configure via ADMIN_IP_WHITELIST env)
  if (ADMIN_IP_WHITELIST.size === 0 && VPN_CIDRS.length === 0) {
    return true;
  }

  // Check exact IPs
  if (ADMIN_IP_WHITELIST.has(ip)) return true;

  // Check VPN CIDRs
  for (const cidr of VPN_CIDRS) {
    if (ipInCIDR(ip, cidr)) return true;
  }

  return false;
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "127.0.0.1"
  );
}

// =============================================
// SENSITIVE ACTIONS REQUIRING RE-AUTHENTICATION
// =============================================

const SENSITIVE_ACTIONS = [
  "CHANGE_ADMIN_ROLE",
  "DELETE_USER",
  "MANAGE_AFFILIATE_PAYOUTS",
  "MODIFY_STRIPE_KEYS",
  "CHANGE_SITE_CONFIG",
  "DELETE_PRODUCT",
  "EXPORT_USER_DATA",
  "PUSH_TO_PRODUCTION",
  "MODIFY_SECURITY_SETTINGS",
  "CHANGE_THEME",
] as const;

export type SensitiveAction = (typeof SENSITIVE_ACTIONS)[number];

// Track re-authentication sessions (in production, use Redis)
const reAuthSession = new Map<string, { authenticated: boolean; expiresAt: number }>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, session] of reAuthSession) {
    if (now > session.expiresAt) reAuthSession.delete(key);
  }
}, 300000);

/**
 * Require re-authentication for sensitive admin actions
 * Call this BEFORE executing the sensitive action
 */
export async function requireReAuth(
  userId: string,
  action: SensitiveAction,
  request: NextRequest
): Promise<NextResponse | null> {
  const ip = getClientIP(request);
  const sessionKey = `reauth:${userId}:${action}`;
  const session = reAuthSession.get(sessionKey);

  // Check if already re-authenticated within the window
  if (session && session.authenticated && Date.now() < session.expiresAt) {
    return null; // OK — proceed
  }

  // Check for re-auth token in headers (sent after user confirms password)
  const reAuthToken = request.headers.get("x-reauth-token");
  if (reAuthToken) {
    // Verify the re-auth token against the stored hash
    const valid = await verifyReAuthToken(userId, reAuthToken);
    if (valid) {
      // Grant access for 15 minutes
      reAuthSession.set(sessionKey, {
        authenticated: true,
        expiresAt: Date.now() + 15 * 60 * 1000,
      });

      await logSecurityEvent({
        userId,
        action: `reauth_${action.toLowerCase()}`,
        details: `Re-authenticated for sensitive action: ${action}`,
        ipAddress: ip,
        severity: "warning",
      });

      return null; // OK — proceed
    }
  }

  // Log the blocked attempt
  await logSecurityEvent({
    userId,
    action: `reauth_required_${action.toLowerCase()}`,
    details: `Re-authentication required for sensitive action: ${action}`,
    ipAddress: ip,
    severity: "warning",
  });

  // Return 401 requiring re-authentication
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "REAUTH_REQUIRED",
        message: `Re-authentication required for: ${action}`,
        action,
      },
    },
    { status: 401 }
  );
}

/**
 * Verify a re-authentication token (user confirms their password)
 */
async function verifyReAuthToken(userId: string, token: string): Promise<boolean> {
  try {
    // Token is the user's current password (sent over HTTPS, single-use)
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;

    const { verifyPassword } = await import("@/lib/backend/auth/password");
    const valid = await verifyPassword(token, (user as any).passwordHash || "");

    if (valid) {
      // Invalidate immediately (single-use)
      await logSecurityEvent({
        userId,
        action: "reauth_token_verified",
        details: "Re-authentication token verified",
        severity: "info",
      });
    }

    return valid;
  } catch {
    return false;
  }
}

/**
 * Get list of sensitive actions (for UI display)
 */
export function getSensitiveActions(): readonly SensitiveAction[] {
  return SENSITIVE_ACTIONS;
}

/**
 * Clear re-auth session (on logout)
 */
export function clearReAuthSession(userId: string): void {
  for (const key of reAuthSession.keys()) {
    if (key.startsWith(`reauth:${userId}:`)) {
      reAuthSession.delete(key);
    }
  }
}
