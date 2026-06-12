import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { mediaId } = await request.json();
    if (!mediaId) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "mediaId is required" } }, { status: 400 });

    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Media not found" } }, { status: 404 });

    // AI alt text generation would go here (e.g., using OpenAI Vision)
    const generatedAlt = `Generated description for ${media.folder || "image"} media`;

    await prisma.media.update({ where: { id: mediaId }, data: { altText: generatedAlt } });
    return NextResponse.json({ success: true, data: { altText: generatedAlt } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "GENERATE_ERROR", message: error.message } }, { status: 500 });
  }
}
