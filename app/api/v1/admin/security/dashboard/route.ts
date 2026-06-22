/**
 * ALAYA INSIDER — Security Dashboard API
 * Aggregates security posture data for the admin security dashboard
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth/auth";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED" } }, { status: 401 });
    }

    // Fetch all security data in parallel
    const [
      recentEvents,
      eventsBySeverity,
      loginStats,
      twoFAStats,
      cspViolations,
      apiKeys,
      totalUsers,
      auditCount,
    ] = await Promise.all([
      // Recent security events (last 24h)
      prisma.securityAuditLog.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 86400000) } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),

      // Events by severity (last 7 days)
      prisma.securityAuditLog.groupBy({
        by: ["severity"],
        where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
        _count: { severity: true },
      }),

      // Login stats (last 24h)
      prisma.loginAttempt.groupBy({
        by: ["success"],
        where: { createdAt: { gte: new Date(Date.now() - 86400000) } },
        _count: { success: true },
      }),

      // 2FA adoption
      prisma.twoFactorAuth.count({ where: { enabled: true } }),

      // CSP violations (last 24h)
      prisma.securityAuditLog.count({
        where: {
          action: "csp_violation",
          createdAt: { gte: new Date(Date.now() - 86400000) },
        },
      }),

      // Active API keys
      prisma.apiKey.count({
        where: {
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } },
          ],
        },
      }),

      // Total users
      prisma.user.count(),

      // Total audit log entries (all time)
      prisma.securityAuditLog.count(),
    ]);

    // Calculate posture score based on key indicators
    const failedLogins = loginStats.find((l) => !l.success)?._count?.success || 0;
    const successfulLogins = loginStats.find((l) => l.success)?._count?.success || 0;
    const totalLogins = failedLogins + successfulLogins;
    const loginSuccessRate = totalLogins > 0 ? (successfulLogins / totalLogins) * 100 : 100;

    const criticalEvents = eventsBySeverity.find((e) => e.severity === "critical")?._count?.severity || 0;
    const warningEvents = eventsBySeverity.find((e) => e.severity === "warning")?._count?.severity || 0;

    // Posture score: 100 - penalties
    let postureScore = 100;
    postureScore -= Math.min(30, criticalEvents * 10);  // -10 per critical event (max -30)
    postureScore -= Math.min(20, warningEvents * 5);     // -5 per warning event (max -20)
    postureScore -= Math.min(15, failedLogins * 3);      // -3 per failed login (max -15)
    postureScore = Math.max(0, Math.min(100, postureScore));

    // Determine overall status
    const getStatusLabel = (score: number): string => {
      if (score >= 90) return "excellent";
      if (score >= 70) return "good";
      if (score >= 50) return "fair";
      return "poor";
    };

    const dashboard = {
      posture: {
        score: Math.round(postureScore),
        label: getStatusLabel(postureScore),
        updatedAt: new Date().toISOString(),
      },
      summary: {
        totalEvents: recentEvents.length,
        criticalEvents,
        warningEvents,
        failedLogins,
        successfulLogins,
        loginSuccessRate: Math.round(loginSuccessRate),
        cspViolations,
        activeApiKeys: apiKeys,
        twoFAEnabled: twoFAStats,
        totalUsers,
        totalAuditEntries: auditCount,
      },
      recentEvents: recentEvents.map((e) => ({
        id: e.id,
        action: e.action,
        details: e.details,
        severity: e.severity,
        createdAt: e.createdAt.toISOString(),
        userId: e.userId,
      })),
      loginStats: {
        failed: failedLogins,
        successful: successfulLogins,
        total: totalLogins,
        successRate: Math.round(loginSuccessRate),
      },
      eventBreakdown: eventsBySeverity.map((e) => ({
        severity: e.severity,
        count: e._count.severity,
      })),
    };

    return NextResponse.json({ success: true, data: dashboard });
  } catch (error: any) {
    console.error("[SecurityDashboard] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL", message: "Failed to load security dashboard" } },
      { status: 500 }
    );
  }
}
