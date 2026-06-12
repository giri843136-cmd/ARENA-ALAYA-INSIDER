import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ success: false, error: { code: "MISSING_USER_ID" } }, { status: 400 });
  }
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
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
      orderBy: { product: { createdAt: "desc" } },
    });
    return NextResponse.json({ success: true, data: favorites });
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
    const favorite = await prisma.favorite.create({
      data: { userId: body.userId, productId: body.productId },
    });
    return NextResponse.json({ success: true, data: favorite }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "CREATE_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    await prisma.favorite.deleteMany({
      where: { userId: body.userId, productId: body.productId },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "DELETE_ERROR", message: error.message } },
      { status: 400 }
    );
  }
}
