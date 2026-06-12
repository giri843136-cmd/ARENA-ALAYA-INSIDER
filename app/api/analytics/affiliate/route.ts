import { NextResponse } from "next/server";
import { affiliateIntelligence } from "@/lib/analytics/services/affiliateIntelligence";

export async function GET() {
  const intel = await affiliateIntelligence.getIntelligence(new Date(Date.now() - 30 * 86400000), new Date());
  return NextResponse.json(intel);
}
