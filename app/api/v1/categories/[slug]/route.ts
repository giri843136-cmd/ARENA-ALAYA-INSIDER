import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: { include: { product: { include: { brand: { select: { name: true, slug: true } }, media: { take: 1 } } } }, take: 48 },
        stats: true,
        seasonalTrends: { orderBy: { year: "desc" }, take: 4 },
      },
    });
    if (!category) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Category not found" } }, { status: 404 });
    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "FETCH_ERROR", message: error.message } }, { status: 500 });
  }
}
