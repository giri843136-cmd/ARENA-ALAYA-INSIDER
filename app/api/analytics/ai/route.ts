import { NextResponse } from "next/server";
import { aiAnalytics } from "@/lib/analytics/services/aiAnalytics";

export async function GET() {
  const data = await aiAnalytics.getAIAnalytics(new Date(Date.now() - 7 * 86400000), new Date());
  return NextResponse.json(data);
}
