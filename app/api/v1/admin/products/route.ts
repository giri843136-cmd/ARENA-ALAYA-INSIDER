import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "newest";

    const where: any = { deletedAt: null };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          brand: { select: { id: true, name: true, slug: true } },
          universe: { select: { id: true, title: true, slug: true } },
          affiliateLinks: { select: { id: true, network: true, health: true } },
          productStats: { select: { pageViews: true, affiliateClicks: true, revenue: true } },
          _count: { select: { reviews: true } },
        },
        orderBy: sort === "oldest" ? { createdAt: "asc" } : 
                 sort === "name" ? { name: "asc" } : 
                 sort === "price" ? { price: "asc" } : 
                 { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "FETCH_ERROR", message: error.message } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categories, tags, media, affiliateLinks, variants, brandId, universeId, ...productData } = body;

    const product = await prisma.product.create({
      data: {
        ...productData,
        price: parseFloat(productData.price) || 0,
        status: productData.status || "DRAFT",
        currency: productData.currency || "USD",
        availability: productData.availability || "IN_STOCK",
        brand: brandId ? { connect: { id: brandId } } : undefined,
        universe: universeId ? { connect: { id: universeId } } : undefined,
      },
    });

    await prisma.activityLog.create({
      data: { action: "create", entityType: "product", entityId: product.id, metadata: { name: product.name } },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "CREATE_ERROR", message: error.message } }, { status: 500 });
  }
}
