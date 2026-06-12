import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const deals = await prisma.deal.findMany({
      where: { endsAt: { gte: new Date() }, product: { status: "PUBLISHED" } },
      orderBy: { endsAt: "asc" },
      include: { product: { select: { id: true, slug: true, name: true, price: true, salePrice: true, rating: true, brand: { select: { name: true } } } } },
      take: 20,
    });
    return NextResponse.json({ success: true, data: deals });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "FETCH_ERROR", message: error.message } }, { status: 500 });
  }
}
