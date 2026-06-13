import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim().toLowerCase();
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));

    const where: any = {};
    if (search) {
      where.fileName = { contains: search, mode: "insensitive" };
    }
    if (status && ["completed", "failed", "processing"].includes(status)) {
      where.status = status;
    }

    const [total, items] = await Promise.all([
      prisma.importHistory.count({ where }),
      prisma.importHistory.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: items.map((h) => ({
        id: h.id,
        fileName: h.fileName,
        totalRows: h.totalRows,
        newRows: h.newRows,
        matchedRows: h.matchedRows,
        failedRows: h.failedRows,
        status: h.status,
        errors: h.errors,
        categoriesLinked: h.categoriesLinked,
        tagsLinked: h.tagsLinked,
        affiliateLinksCreated: h.affiliateLinksCreated,
        mediaCreated: h.mediaCreated,
        presetId: h.presetId,
        createdAt: h.createdAt.toISOString(),
      })),
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      await prisma.importHistory.delete({ where: { id } });
    } else {
      // Clear all history
      await prisma.importHistory.deleteMany({});
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "DELETE_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
