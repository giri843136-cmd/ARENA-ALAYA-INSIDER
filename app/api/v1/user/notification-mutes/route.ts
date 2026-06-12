import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hasMutedCommentNotifications, toggleCommentNotificationMute } from "@/lib/comment/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/v1/user/notification-mutes?userId=xxx
// Returns the mute status for comment notifications for the given user
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { success: false, error: { code: "MISSING_USER_ID", message: "userId is required" } },
      { status: 400 }
    );
  }

  try {
    const muted = await hasMutedCommentNotifications(userId);

    // Also return all mutes for this user (for full preferences UI)
    const mutes = await prisma.notificationMute.findMany({
      where: { userId },
      select: {
        id: true,
        targetType: true,
        targetId: true,
        muteUntil: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        commentNotificationsMuted: muted,
        mutes,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

// POST /api/v1/user/notification-mutes
// Body: { userId, targetType, targetId, muted }
// Toggles mute for a specific notification type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, targetType, targetId, muted } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_USER_ID", message: "userId is required" } },
        { status: 400 }
      );
    }

    // Support both full-target mutes and the simplified comment notification mute
    if (targetType === "notification_type" && targetId === "COMMENT_STATUS_CHANGED") {
      const result = await toggleCommentNotificationMute(userId, muted);
      return NextResponse.json({ success: true, data: result });
    }

    // Generic mute toggle for any target type/id
    if (muted) {
      await prisma.notificationMute.upsert({
        where: {
          userId_targetType_targetId: { userId, targetType: targetType || "notification_type", targetId: targetId || "custom" },
        },
        update: {},
        create: {
          userId,
          targetType: targetType || "notification_type",
          targetId: targetId || "custom",
        },
      });
      return NextResponse.json({ success: true, data: { muted: true } });
    } else {
      await prisma.notificationMute.deleteMany({
        where: { userId, targetType: targetType || "notification_type", targetId: targetId || "custom" },
      });
      return NextResponse.json({ success: true, data: { muted: false } });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
