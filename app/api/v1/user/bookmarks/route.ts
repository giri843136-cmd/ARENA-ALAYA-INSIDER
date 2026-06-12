import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "userId is required" } }, { status: 400 });

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: bookmarks });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "FETCH_ERROR", message: error.message } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, productId, articleId } = await request.json();
    if (!userId) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "userId is required" } }, { status: 400 });

    const bookmark = await prisma.bookmark.create({
      data: { userId, productId: productId || null, articleId: articleId || null },
    });
    return NextResponse.json({ success: true, data: bookmark }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") return NextResponse.json({ success: false, error: { code: "DUPLICATE", message: "Bookmark already exists" } }, { status: 409 });
    return NextResponse.json({ success: false, error: { code: "CREATE_ERROR", message: error.message } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, productId, articleId } = await request.json();
    if (!userId) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "userId is required" } }, { status: 400 });

    await prisma.bookmark.deleteMany({
      where: { userId, ...(productId && { productId }), ...(articleId && { articleId }) },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "DELETE_ERROR", message: error.message } }, { status: 500 });
  }
}
