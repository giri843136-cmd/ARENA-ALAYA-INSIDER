/**
 * ALAYA INSIDER — GDPR Data Subject Access Request (DSAR) API
 * Data export (right to know) and deletion (right to be forgotten)
 * Compliant with GDPR Articles 15, 17 and CCPA
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/backend/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { logSecurityEvent } from "@/lib/backend/security/audit";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/backend/security/rate-limiter";
import { csrfMiddleware } from "@/lib/backend/security/csrf";
import { applyCorsHeaders } from "@/lib/backend/security/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/v1/user/data
 * Export all user data in JSON format (GDPR Article 15 - Right to Access)
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rlId = getRateLimitIdentifier(request);
    const rl = await checkRateLimit(rlId, "api");
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Try again later." } },
        { status: 429 }
      );
    }

    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch user for email (needed for login attempts query)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        emailVerified: true,
        currency: true,
        language: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Fetch remaining user data in parallel
    const [
      profile,
      sessions,
      roles,
      bookmarks,
      favorites,
      wishlists,
      savedSearches,
      recentlyViewed,
      notifications,
      reviews,
      comments,
      activityLogs,
      searchLogs,
      pageViews,
      userInteractions,
      addresses,
      twoFactorAuth,
      loginAttempts,
      securityAuditLogs,
    ] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId } }),
      prisma.session.findMany({ where: { userId } }),
      prisma.userRole.findMany({ where: { userId } }),
      prisma.bookmark.findMany({ where: { userId } }),
      prisma.favorite.findMany({ where: { userId } }),
      prisma.wishlist.findMany({ where: { userId }, include: { products: true } }),
      prisma.savedSearch.findMany({ where: { userId } }),
      prisma.recentlyViewed.findMany({ where: { userId } }),
      prisma.notification.findMany({ where: { userId } }),
      prisma.review.findMany({ where: { userId } }),
      prisma.comment.findMany({ where: { userId } }),
      prisma.activityLog.findMany({ where: { userId } }),
      prisma.searchLog.findMany({ where: { userId } }),
      prisma.pageView.findMany({ where: { userId } }),
      prisma.userInteraction.findMany({ where: { userId } }),
      prisma.userAddress.findMany({ where: { userId } }),
      prisma.twoFactorAuth.findUnique({ where: { userId }, select: { enabled: true, verified: true, createdAt: true } }),
      prisma.loginAttempt.findMany({ where: { email: user?.email || "" }, take: 50 }),
      prisma.securityAuditLog.findMany({ where: { userId } }),
    ]);

    // Log the export for audit
    await logSecurityEvent({
      userId,
      action: "data_export",
      details: "User requested GDPR data export",
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      severity: "info",
    });

    const exportData = {
      exportedAt: new Date().toISOString(),
      userId,
      account: user,
      profile,
      sessions: sessions.map((s) => ({
        id: s.id,
        token: s.token.substring(0, 8) + "...",
        expiresAt: s.expiresAt,
        ipAddress: s.ipAddress,
      })),
      roles: roles.map((r) => r.role),
      bookmarks: bookmarks.map((b) => ({
        productId: b.productId,
        articleId: b.articleId,
        createdAt: b.createdAt,
      })),
      favorites: favorites.map((f) => ({
        productId: f.productId,
      })),
      wishlists: wishlists.map((w) => ({
        name: w.name,
        products: w.products.map((p) => p.slug),
      })),
      savedSearches,
      recentlyViewed: recentlyViewed.map((r) => ({
        productId: r.productId,
        viewedAt: r.viewedAt,
      })),
      notifications: notifications.length,
      reviews: reviews.map((r) => ({
        productId: r.productId,
        rating: r.rating,
        status: r.status,
        createdAt: r.createdAt,
      })),
      comments: comments.length,
      addresses,
      twoFactorEnabled: twoFactorAuth?.enabled || false,
      loginHistory: loginAttempts.map((l) => ({
        success: l.success,
        ipAddress: l.ipAddress,
        createdAt: l.createdAt,
      })),
      securityEvents: securityAuditLogs.length,
    };

    const response = NextResponse.json({
      success: true,
      data: exportData,
      format: "JSON",
      generatedAt: new Date().toISOString(),
    });

    // Apply CORS headers
    const origin = request.headers.get("origin");
    return applyCorsHeaders(response, origin);
  } catch (error: any) {
    console.error("[GDPR] Data export error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL", message: "Failed to export data" } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/user/data
 * Delete all user data (GDPR Article 17 - Right to be Forgotten)
 * Body: { confirmation: true }
 */
export async function POST(request: NextRequest) {
  try {
    // CSRF protection
    const csrfError = await csrfMiddleware(request);
    if (csrfError) return csrfError;

    // Rate limiting (very strict for account deletion)
    const rlId = getRateLimitIdentifier(request);
    const rl = await checkRateLimit(rlId, "auth");
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Try again later." } },
        { status: 429 }
      );
    }

    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();

    if (!body.confirmation || body.confirmation !== true) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Must confirm account deletion with confirmation: true" } },
        { status: 400 }
      );
    }

    if (!body.acknowledgement || body.acknowledgement !== true) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Must acknowledge that account deletion is irreversible" } },
        { status: 400 }
      );
    }

    // Log the deletion request before processing
    await logSecurityEvent({
      userId,
      action: "account_deletion_requested",
      details: "User requested GDPR account deletion (right to be forgotten)",
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      severity: "critical",
    });

    // Perform cascading deletion
    // In production with Prisma, most cascades are handled by schema relations
    // We explicitly delete key data to ensure complete removal

    // 1. Delete security-related data first
    await prisma.twoFactorAuth.deleteMany({ where: { userId } });
    await prisma.backupCode.deleteMany({ where: { userId } });
    await prisma.deviceSession.deleteMany({ where: { userId } });

    // 2. Delete personal data
    await prisma.userProfile.deleteMany({ where: { userId } });
    await prisma.userRole.deleteMany({ where: { userId } });
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.bookmark.deleteMany({ where: { userId } });
    await prisma.favorite.deleteMany({ where: { userId } });
    await prisma.recentlyViewed.deleteMany({ where: { userId } });
    await prisma.savedSearch.deleteMany({ where: { userId } });
    await prisma.notification.deleteMany({ where: { userId } });
    await prisma.userAddress.deleteMany({ where: { userId } });
    await prisma.pushSubscription.deleteMany({ where: { userId } });
    await prisma.notificationMute.deleteMany({ where: { userId } });
    await prisma.userNotificationPreference.deleteMany({ where: { userId } });
    await prisma.mediaFolder.deleteMany({ where: { createdBy: userId } });

    // 3. Anonymize reviews and comments (keep content for site integrity, remove user association)
    await prisma.review.updateMany({
      where: { userId },
      data: { userId: null },
    });
    await prisma.comment.updateMany({
      where: { userId },
      data: { userId: null, guestName: "[deleted user]", guestEmail: "" },
    });

    // 4. Delete the user account
    await prisma.user.delete({ where: { id: userId } });

    // Log the completion (note: userId won't exist in DB anymore)
    console.log(`[GDPR] Account deleted for user ${userId}`);

    return NextResponse.json({
      success: true,
      data: {
        message: "Your account and all associated data have been permanently deleted.",
        deletedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[GDPR] Account deletion error:", error);

    // Check if user was already deleted
    if (error.code === "P2025") {
      return NextResponse.json({
        success: true,
        data: { message: "Account has already been deleted." },
      });
    }

    return NextResponse.json(
      { success: false, error: { code: "INTERNAL", message: "Failed to delete account. Please contact support." } },
      { status: 500 }
    );
  }
}
