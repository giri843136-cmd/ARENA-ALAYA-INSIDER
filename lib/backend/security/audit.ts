/**
 * ALAYA INSIDER — Security Audit Logging
 * Immutable audit trail for all security-critical actions
 */

import { prisma } from "@/lib/db/prisma";

type Severity = "info" | "warning" | "critical";

interface SecurityEvent {
  userId?: string;
  action: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  severity?: Severity;
}

/**
 * Log a security event to the immutable audit trail
 */
export async function logSecurityEvent(event: SecurityEvent) {
  try {
    await prisma.securityAuditLog.create({
      data: {
        userId: event.userId || null,
        action: event.action,
        details: event.details || null,
        ipAddress: event.ipAddress || null,
        userAgent: event.userAgent || null,
        severity: event.severity || "info",
      },
    });
  } catch (error) {
    // Never throw - audit logging must never break the app
    console.error("Failed to log security event:", error);
  }
}

/**
 * Get recent security events for a user
 */
export async function getSecurityEvents(
  options: {
    userId?: string;
    limit?: number;
    severity?: Severity;
    action?: string;
  } = {}
) {
  const where: any = {};
  if (options.userId) where.userId = options.userId;
  if (options.severity) where.severity = options.severity;
  if (options.action) where.action = options.action;

  return prisma.securityAuditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: options.limit || 100,
  });
}

/**
 * Get login attempt history for an email
 */
export async function getLoginAttempts(
  email: string,
  limit = 20
) {
  return prisma.loginAttempt.findMany({
    where: { email },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Check if an IP or email is rate-limited (too many failed attempts)
 */
export async function isRateLimited(
  email: string,
  ipAddress: string,
  maxAttempts = 5,
  windowMinutes = 15
): Promise<boolean> {
  const since = new Date(Date.now() - windowMinutes * 60 * 1000);

  const [emailAttempts, ipAttempts] = await Promise.all([
    prisma.loginAttempt.count({
      where: {
        email,
        success: false,
        createdAt: { gte: since },
      },
    }),
    prisma.loginAttempt.count({
      where: {
        ipAddress,
        success: false,
        createdAt: { gte: since },
      },
    }),
  ]);

  return emailAttempts >= maxAttempts || ipAttempts >= maxAttempts * 2;
}

/**
 * Check and auto-lock an account after too many consecutive failed attempts
 * Returns true if the account was just locked
 */
export async function checkAndLockAccount(email: string): Promise<boolean> {
  const since = new Date(Date.now() - 30 * 60 * 1000); // 30 min window
  const recentFailures = await prisma.loginAttempt.count({
    where: {
      email,
      success: false,
      createdAt: { gte: since },
    },
  });

  // Auto-lock after 10 consecutive failures within 30 min
  if (recentFailures >= 10) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && !user.blocked) {
      await prisma.user.update({
        where: { email },
        data: { blocked: true },
      });
      await logSecurityEvent({
        userId: user.id,
        action: "account_auto_locked",
        details: `Account auto-locked after ${recentFailures} consecutive failed login attempts`,
        severity: "critical",
      });
      return true;
    }
  }
  return false;
}

/**
 * Unlock a previously locked account (admin action)
 */
export async function unlockAccount(userId: string, adminId: string): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { blocked: false },
    });
    await logSecurityEvent({
      userId: adminId,
      action: "account_unlocked",
      details: `Account ${userId} manually unlocked by admin ${adminId}`,
      severity: "info",
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Record a login attempt
 */
export async function recordLoginAttempt(params: {
  email: string;
  ipAddress: string;
  userAgent?: string;
  success: boolean;
  failReason?: string;
}) {
  try {
    await prisma.loginAttempt.create({
      data: {
        email: params.email,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent || null,
        success: params.success,
        failReason: params.failReason || null,
      },
    });

    if (!params.success) {
      await checkAndLockAccount(params.email);
    }
  } catch {
    // Never throw
  }
}
