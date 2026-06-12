import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const brand = await prisma.brand.findUnique({
      where: { slug },
      include: {
        products: { where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" }, take: 48, include: { media: { take: 1 } } },
        affiliateLinks: { where: { health: "HEALTHY" } },
        stats: true,
      },
    });
    if (!brand) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Brand not found" } }, { status: 404 });
    return NextResponse.json({ success: true, data: brand });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "FETCH_ERROR", message: error.message } }, { status: 500 });
  }
}
