import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";
    const altText = formData.get("altText") as string | null;

    if (!file) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "file is required" } }, { status: 400 });

    // In production, upload to Cloudinary/S3 here
    // For now, create a media record with a placeholder URL
    const media = await prisma.media.create({
      data: {
        url: `/uploads/${folder}/${file.name}`,
        publicId: `uploads/${folder}/${file.name}`,
        type: file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
        folder,
        altText,
        format: file.name.split(".").pop()?.toLowerCase() || null,
        size: file.size,
      },
    });

    return NextResponse.json({ success: true, data: media }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "UPLOAD_ERROR", message: error.message } }, { status: 500 });
  }
}
