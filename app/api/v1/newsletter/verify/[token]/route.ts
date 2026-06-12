import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  try {
    const subscriber = await prisma.emailSubscriber.findFirst({ where: { verificationToken: token } });
    if (!subscriber) {
      return NextResponse.json({ success: false, error: { code: "INVALID_TOKEN", message: "Invalid or expired verification token" } }, { status: 400 });
    }
    await prisma.emailSubscriber.update({ where: { id: subscriber.id }, data: { verified: true, verificationToken: null } });
    return NextResponse.json({ success: true, data: { message: "Email verified successfully" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "VERIFY_ERROR", message: error.message } }, { status: 500 });
  }
}
