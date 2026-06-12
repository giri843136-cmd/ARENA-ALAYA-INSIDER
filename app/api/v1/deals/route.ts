import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));

  try {
    const now = new Date();
    const where = { endsAt: { gte: now } };

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        orderBy: { endsAt: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          product: {
            select: {
              id: true, slug: true, name: true, price: true, salePrice: true,
              rating: true, reviewCount: true,
              brand: { select: { name: true, slug: true } },
              media: { take: 1, orderBy: { createdAt: "asc" } },
            },
          },
        },
      }),
      prisma.deal.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: deals,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
