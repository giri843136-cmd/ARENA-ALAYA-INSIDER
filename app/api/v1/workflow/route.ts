import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/v1/workflow?contentType=article&contentId=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contentType = searchParams.get("contentType");
  const contentId = searchParams.get("contentId");

  try {
    const where: any = {};
    if (contentType) where.contentType = contentType;
    if (contentId) where.contentId = contentId;

    const [checklists, reviews] = await Promise.all([
      prisma.contentChecklist.findMany({ where, orderBy: { createdAt: "desc" } }),
      prisma.contentReview.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { reviewer: { select: { id: true, name: true, avatar: true } } },
      }),
    ]);

    return NextResponse.json({ success: true, data: { checklists, reviews } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

// POST /api/v1/workflow — Create/edit checklists, manage reviews
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case "create_checklist": {
        const checklist = await prisma.contentChecklist.create({
          data: {
            contentType: data.contentType,
            contentId: data.contentId,
            checklistType: data.checklistType,
            items: data.items || [],
          },
        });
        return NextResponse.json({ success: true, data: checklist }, { status: 201 });
      }

      case "update_checklist_items": {
        const { checklistId, items } = data;
        const updated = await prisma.contentChecklist.update({
          where: { id: checklistId },
          data: { items },
        });
        const allDone = items.every((i: any) => i.completed);
        if (allDone) {
          await prisma.contentChecklist.update({
            where: { id: checklistId },
            data: { completedAt: new Date() },
          });
        }
        return NextResponse.json({ success: true, data: updated });
      }

      case "submit_review": {
        const review = await prisma.contentReview.create({
          data: {
            contentType: data.contentType,
            contentId: data.contentId,
            reviewerId: data.reviewerId,
            status: "PENDING",
            comments: data.comments,
          },
          include: { reviewer: { select: { id: true, name: true, avatar: true } } },
        });
        return NextResponse.json({ success: true, data: review }, { status: 201 });
      }

      case "update_review_status": {
        const { reviewId, status, comments } = data;
        const updated = await prisma.contentReview.update({
          where: { id: reviewId },
          data: {
            status,
            comments: comments || undefined,
            resolvedAt: ["APPROVED", "REJECTED"].includes(status) ? new Date() : undefined,
          },
        });
        return NextResponse.json({ success: true, data: updated });
      }

      case "update_content_status": {
        const { contentType, contentId, status } = data;
        if (contentType === "article") {
          await prisma.article.update({ where: { id: contentId }, data: { status } });
        } else if (contentType === "product") {
          await prisma.product.update({ where: { id: contentId }, data: { status } });
        }
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { success: false, error: { code: "INVALID_ACTION", message: `Unknown action: ${action}` } },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "WORKFLOW_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}
