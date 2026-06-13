import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { revenueIntelligence } from "@/lib/analytics/services/revenueIntelligence";
import { affiliateIntelligence } from "@/lib/analytics/services/affiliateIntelligence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30");
  const start = new Date(Date.now() - days * 86400000);
  const end = new Date();

  try {
    // 1. Revenue metrics from analytics events
    const revenueMetrics = await revenueIntelligence.getRevenueMetrics(start, end);
    const forecast = await revenueIntelligence.getRevenueForecast(30);

    // 2. Affiliate intelligence
    const affiliateIntel = await affiliateIntelligence.getIntelligence(start, end);

    // 3. Top earning products from ProductStat + AffiliateLink
    const topProducts = await prisma.productStat.findMany({
      orderBy: { revenue: "desc" },
      take: 20,
      include: { product: { select: { id: true, name: true, slug: true, price: true, brand: { select: { name: true } } } } },
    });

    // 4. Network breakdown from AffiliateLink aggregate
    const networkStats = await prisma.affiliateLink.groupBy({
      by: ["network"],
      _sum: { revenue: true, clicks: true, conversions: true },
      _count: { id: true },
    });

    // 5. Commission summary
    const totalAffiliateLinks = await prisma.affiliateLink.count();
    const healthyLinks = await prisma.affiliateLink.count({ where: { health: "HEALTHY" } });
    const brokenLinks = await prisma.affiliateLink.count({ where: { health: { in: ["BROKEN", "EXPIRED"] } } });

    // 6. Monthly revenue trend (last 12 months)
    const monthlyRevenue = await prisma.analyticsEvent.findMany({
      where: {
        name: "revenue.attributed",
        timestamp: { gte: new Date(Date.now() - 365 * 86400000) },
      },
      select: { revenue: true, commission: true, timestamp: true, network: true },
      orderBy: { timestamp: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue: revenueMetrics.totalRevenue,
          totalCommission: revenueMetrics.totalCommission,
          orderCount: revenueMetrics.orderCount,
          avgOrderValue: revenueMetrics.avgOrderValue,
          commissionRate: revenueMetrics.commissionRate,
          forecast: forecast.predicted,
        },
        byNetwork: networkStats.map((n) => ({
          network: n.network,
          revenue: n._sum.revenue || 0,
          clicks: n._sum.clicks || 0,
          conversions: n._sum.conversions || 0,
          linkCount: n._count.id,
        })),
        topProducts: topProducts.map((ps) => ({
          id: ps.product.id,
          name: ps.product.name,
          slug: ps.product.slug,
          brand: ps.product.brand.name,
          price: Number(ps.product.price),
          revenue: Number(ps.revenue),
          clicks: ps.affiliateClicks,
          conversions: ps.conversions,
        })),
        linkHealth: {
          total: totalAffiliateLinks,
          healthy: healthyLinks,
          broken: brokenLinks,
          healthRate: totalAffiliateLinks > 0 ? (healthyLinks / totalAffiliateLinks) * 100 : 0,
        },
        opportunities: affiliateIntel.opportunities,
        monthlyRevenue: monthlyRevenue.map((e) => ({
          month: e.timestamp.toISOString().slice(0, 7),
          revenue: Number(e.revenue || 0),
          commission: Number(e.commission || 0),
          network: e.network || "unknown",
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: { code: "FETCH_ERROR", message: error.message },
    }, { status: 500 });
  }
}
