import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string; versionId: string }> }) {
  const { id, versionId } = await params;
  try {
    const version = await prisma.articleVersion.findUnique({ where: { id: versionId } });
    if (!version || version.articleId !== id) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Version not found" } }, { status: 404 });
    }
    // Snapshot current state before rolling back (so rollbacks are reversible)
    const current = await prisma.article.findUnique({ where: { id }, select: { title: true, content: true, excerpt: true, status: true } });
    if (current) {
      await prisma.articleVersion.create({
        data: {
          articleId: id,
          title: current.title,
          content: current.content,
          excerpt: current.excerpt,
          status: current.status,
          diff: { type: "auto-snapshot-before-rollback", rolledBackTo: versionId },
        },
      });
    }

    const article = await prisma.article.update({
      where: { id },
      data: { title: version.title, content: version.content, excerpt: version.excerpt || undefined, status: version.status },
    });
    return NextResponse.json({ success: true, data: { article, rolledBackTo: versionId } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "ROLLBACK_ERROR", message: error.message } }, { status: 500 });
  }
}
