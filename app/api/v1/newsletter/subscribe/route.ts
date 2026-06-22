import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Valid email is required" } }, { status: 400 });
    }

    const existing = await prisma.emailSubscriber.findUnique({ where: { email } });
    if (existing) {
      if (existing.verified) return NextResponse.json({ success: true, data: { message: "Already subscribed" } });
      // Resend verification
      const token = existing.verificationToken || crypto.randomBytes(32).toString("hex");
      await prisma.emailSubscriber.update({ where: { email }, data: { verificationToken: token } });
      return NextResponse.json({ success: true, data: { message: "Verification email sent" } });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    await prisma.emailSubscriber.create({
      data: { email, name: name || null, verificationToken },
    });

    return NextResponse.json({ success: true, data: { message: "Verification email sent" } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "SUBSCRIBE_ERROR", message: error.message } }, { status: 500 });
  }
}
