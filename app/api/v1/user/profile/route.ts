import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "userId is required" } }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatar: true, language: true, theme: true, currency: true, createdAt: true, profile: true },
    });
    if (!user) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, { status: 404 });
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "FETCH_ERROR", message: error.message } }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, name, avatar, language, theme, currency, bio, location, interests, preferredUniverses } = await request.json();
    if (!userId) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "userId is required" } }, { status: 400 });

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(avatar !== undefined && { avatar }),
        ...(language !== undefined && { language }),
        ...(theme !== undefined && { theme }),
        ...(currency !== undefined && { currency }),
        ...((bio !== undefined || location !== undefined || interests !== undefined || preferredUniverses !== undefined) && {
          profile: {
            upsert: {
              create: { bio, location, interests, preferredUniverses },
              update: { ...(bio !== undefined && { bio }), ...(location !== undefined && { location }), ...(interests !== undefined && { interests }), ...(preferredUniverses !== undefined && { preferredUniverses }) },
            },
          },
        }),
      },
      select: { id: true, name: true, email: true, avatar: true, language: true, theme: true, currency: true, createdAt: true, profile: true },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "UPDATE_ERROR", message: error.message } }, { status: 500 });
  }
}
