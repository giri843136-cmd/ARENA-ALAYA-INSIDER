import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const universe = searchParams.get("universe");
  const sort = searchParams.get("sort") || "newest";
  const status = searchParams.get("status") || "PUBLISHED";
  const cursor = searchParams.get("cursor");

  try {
    const where: any = { status };
    if (category) where.categories = { some: { category: { slug: category } } };
    if (brand) where.brand = { slug: brand };
    if (universe) where.universe = { slug: universe.toUpperCase() };

    const orderBy: any =
      sort === "price_asc" ? { price: "asc" as const } :
      sort === "price_desc" ? { price: "desc" as const } :
      sort === "rating" ? { rating: "desc" as const } :
      sort === "name" ? { name: "asc" as const } :
      { publishedAt: "desc" as const };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: cursor ? 0 : (page - 1) * limit,
        take: limit,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: {
          brand: { select: { id: true, name: true, slug: true, logo: true } },
          universe: { select: { id: true, slug: true, title: true } },
          media: { take: 1, orderBy: { createdAt: "asc" } },
          _count: { select: { reviews: true, favorites: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product = await prisma.product.create({
      data: {
        slug: body.slug,
        name: body.name,
        shortDescription: body.shortDescription,
        longDescription: body.longDescription,
        price: body.price,
        salePrice: body.salePrice,
        currency: body.currency || "USD",
        rating: body.rating || 0,
        reviewCount: body.reviewCount || 0,
        availability: body.availability || "IN_STOCK",
        status: body.status || "DRAFT",
        brandId: body.brandId,
        universeId: body.universeId,
        benefits: body.benefits || [],
        pros: body.pros || [],
        cons: body.cons || [],
        perfectFor: body.perfectFor || [],
      },
    });
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "CREATE_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}
