import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get("sortBy") || "revenue";
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));

  try {
    const orderBy: any = sortBy === "views" ? { pageViews: "desc" } :
      sortBy === "clicks" ? { affiliateClicks: "desc" } : { revenueGenerated: "desc" };

    const articles = await prisma.articleStat.findMany({
      orderBy,
      take: limit,
      include: {
        article: { select: { id: true, title: true, slug: true, publishedAt: true, author: { select: { name: true } } } },
      },
    });

    const authorStats = await prisma.authorStat.findMany({
      orderBy: { totalRevenue: "desc" },
      include: { author: { select: { name: true } } },
    });

    return NextResponse.json({
      success: true,
      data: {
        articles: articles.map((a) => ({
          id: a.article.id,
          title: a.article.title,
          slug: a.article.slug,
          author: a.article.author,
          pageViews: a.pageViews,
          uniqueVisitors: a.uniqueVisitors,
          affiliateClicks: a.affiliateClicks,
          revenueGenerated: Number(a.revenueGenerated),
          scrollDepthAvg: Number(a.scrollDepthAvg),
          timeOnPageAvg: a.timeOnPageAvg,
          publishedAt: a.article.publishedAt,
        })),
        authors: authorStats.map((a) => ({
          name: a.author.name,
          totalArticles: a.totalArticles,
          totalClicks: Number(a.totalClicks),
          totalRevenue: Number(a.totalRevenue),
          avgReadingTime: Number(a.avgReadingTime),
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "FETCH_ERROR", message: error.message } }, { status: 500 });
  }
}
