import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        universe: true,
        affiliateLinks: true,
        media: true,
        variants: true,
        metadata: true,
        deals: true,
        productCategories: { include: { category: true } },
        productTags: { include: { tag: true } },
        productStats: true,
        faqs: { orderBy: { order: "asc" } },
      },
    });
    if (!product) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Product not found" } }, { status: 404 });
    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "FETCH_ERROR", message: error.message } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { categories, tags, media, affiliateLinks, variants, faqs, deals, ...productData } = body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        price: productData.price !== undefined ? parseFloat(productData.price) : undefined,
        salePrice: productData.salePrice !== undefined ? (productData.salePrice ? parseFloat(productData.salePrice) : null) : undefined,
        rating: productData.rating !== undefined ? parseFloat(productData.rating) : undefined,
        reviewCount: productData.reviewCount !== undefined ? parseInt(productData.reviewCount) : undefined,
        ...(categories ? {
          productCategories: {
            deleteMany: {},
            create: categories.map((c: string) => ({ categoryId: c })),
          }
        } : {}),
        ...(tags ? {
          productTags: {
            deleteMany: {},
            create: tags.map((t: string) => ({ tagId: t })),
          }
        } : {}),
      },
    });

    await prisma.activityLog.create({
      data: { action: "update", entityType: "product", entityId: id, metadata: { changes: Object.keys(productData) } },
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "UPDATE_ERROR", message: error.message } }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.product.update({ where: { id }, data: { status: "ARCHIVED", deletedAt: new Date() } });
    await prisma.activityLog.create({
      data: { action: "delete", entityType: "product", entityId: id },
    });
    return NextResponse.json({ success: true, data: { id } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "DELETE_ERROR", message: error.message } }, { status: 500 });
  }
}
