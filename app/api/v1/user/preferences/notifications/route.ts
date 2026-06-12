import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/v1/user/preferences/notifications?userId=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "userId is required" } },
      { status: 400 }
    );
  }

  try {
    let prefs = await prisma.userNotificationPreference.findUnique({
      where: { userId },
    });

    // Return defaults if not yet configured
    if (!prefs) {
      prefs = {
        id: "",
        userId,
        priceDropEmail: false,
        priceDropPush: true,
        priceDropInApp: true,
        dealAlertEmail: false,
        dealAlertPush: true,
        dealAlertInApp: true,
        newArticleEmail: false,
        newArticlePush: false,
        newArticleInApp: true,
        commentReplyEmail: false,
        commentReplyPush: true,
        commentReplyInApp: true,
        weeklyDigestEmail: true,
        backInStockEmail: false,
        backInStockPush: true,
        backInStockInApp: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return NextResponse.json({ success: true, data: prefs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

// PUT /api/v1/user/preferences/notifications
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...prefs } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "userId is required" } },
        { status: 400 }
      );
    }

    // Only allow known preference fields
    const allowedFields = [
      "priceDropEmail", "priceDropPush", "priceDropInApp",
      "dealAlertEmail", "dealAlertPush", "dealAlertInApp",
      "newArticleEmail", "newArticlePush", "newArticleInApp",
      "commentReplyEmail", "commentReplyPush", "commentReplyInApp",
      "weeklyDigestEmail",
      "backInStockEmail", "backInStockPush", "backInStockInApp",
    ];

    const sanitized: Record<string, boolean> = {};
    for (const field of allowedFields) {
      if (typeof prefs[field] === "boolean") {
        sanitized[field] = prefs[field];
      }
    }

    const data = await prisma.userNotificationPreference.upsert({
      where: { userId },
      create: { userId, ...sanitized },
      update: sanitized,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
