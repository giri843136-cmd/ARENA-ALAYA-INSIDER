import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const links = await prisma.affiliateLink.findMany({
      where: { health: { not: "EXPIRED" } },
      take: 200,
    });

    let checked = 0;
    let broken = 0;

    for (const link of links) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(link.url, { method: "HEAD", signal: controller.signal, redirect: "manual" });
        clearTimeout(timeout);

        const isWorking = res.status >= 200 && res.status < 400;
        await prisma.affiliateLinkHealth.create({
          data: {
            affiliateLinkId: link.id,
            isWorking,
            responseTimeMs: null,
            redirectChain: [],
            lastChecked: new Date(),
          },
        });

        await prisma.affiliateLink.update({
          where: { id: link.id },
          data: { health: isWorking ? "HEALTHY" : "BROKEN", lastChecked: new Date() },
        });

        if (!isWorking) broken++;
        checked++;
      } catch {
        await prisma.affiliateLinkHealth.create({
          data: { affiliateLinkId: link.id, isWorking: false, responseTimeMs: null, redirectChain: [], lastChecked: new Date(), errorMessage: "Connection failed" },
        });
        await prisma.affiliateLink.update({ where: { id: link.id }, data: { health: "BROKEN", lastChecked: new Date() } });
        broken++;
        checked++;
      }
    }

    return NextResponse.json({ success: true, data: { checked, broken, total: links.length } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "SCAN_ERROR", message: error.message } }, { status: 500 });
  }
}
