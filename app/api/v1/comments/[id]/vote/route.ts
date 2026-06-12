import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { vote } = await request.json();
    if (vote !== "upvote" && vote !== "downvote") {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "vote must be 'upvote' or 'downvote'" } }, { status: 400 });
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: vote === "upvote" ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } },
    });

    return NextResponse.json({ success: true, data: { upvotes: comment.upvotes, downvotes: comment.downvotes } });
  } catch (error: any) {
    if (error.code === "P2025") return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Comment not found" } }, { status: 404 });
    return NextResponse.json({ success: false, error: { code: "VOTE_ERROR", message: error.message } }, { status: 500 });
  }
}
