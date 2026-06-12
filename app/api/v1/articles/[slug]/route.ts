import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: true,
        universe: true,
        comments: { where: { status: "APPROVED", deletedAt: null }, orderBy: { createdAt: "desc" }, take: 20, include: { user: { select: { id: true, name: true, avatar: true } }, replies: { include: { user: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: "asc" } } } },
        articleStats: true,
        articleTags: { include: { tag: true } },
        productRecommendations: { include: { product: { select: { id: true, slug: true, name: true, price: true, salePrice: true, rating: true, brand: { select: { name: true } } } } }, take: 10 },
      },
    });
    if (!article) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Article not found" } }, { status: 404 });
    return NextResponse.json({ success: true, data: article });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "FETCH_ERROR", message: error.message } }, { status: 500 });
  }
}
