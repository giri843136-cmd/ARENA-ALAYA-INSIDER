import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        universe: true,
        affiliateLinks: true,
        media: true,
        reviews: { where: { status: "APPROVED" }, take: 10, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true, avatar: true } } } },
        faqs: { orderBy: { order: "asc" } },
        variants: true,
        metadata: true,
        deals: { where: { endsAt: { gte: new Date() } }, orderBy: { endsAt: "asc" } },
        productCategories: { include: { category: true } },
        productTags: { include: { tag: true } },
        relatedProductsFrom: { include: { to: { select: { id: true, slug: true, name: true, price: true, salePrice: true, rating: true, brand: { select: { name: true } } } } }, take: 8 },
        productStats: true,
      },
    });
    if (!product) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Product not found" } }, { status: 404 });
    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "FETCH_ERROR", message: error.message } }, { status: 500 });
  }
}
