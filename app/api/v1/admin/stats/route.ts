import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [productCount, articleCount, brandCount, categoryCount, commentCount, userCount, dealCount, pendingReviewCount] = await Promise.all([
      prisma.product.count({ where: { status: "PUBLISHED" } }),
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.brand.count(),
      prisma.category.count(),
      prisma.comment.count(),
      prisma.user.count(),
      prisma.deal.count({ where: { endsAt: { gte: new Date() } } }),
      prisma.contentReview.count({ where: { status: "PENDING" } }),
    ]);
    return NextResponse.json({ success: true, data: { productCount, articleCount, brandCount, categoryCount, commentCount, userCount, dealCount, pendingReviewCount } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "FETCH_ERROR", message: error.message } }, { status: 500 });
  }
}
