import { NextRequest, NextResponse } from "next/server";
import { IMPORT_PRESETS, detectBestPreset } from "@/lib/import/presets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const headersParam = searchParams.get("headers");

  const presets = IMPORT_PRESETS.map((p) => ({
    id: p.id,
    name: p.name,
    network: p.network,
    description: p.description,
    defaultNetwork: p.defaultNetwork,
    columnCount: Object.keys(p.columns).length,
  }));

  let recommended = null;

  // If headers are provided, auto-detect the best preset
  if (headersParam) {
    const headers = headersParam.split(",").map((h) => h.trim());
    const result = detectBestPreset(headers);
    if (result.score >= 30) {
      recommended = {
        id: result.preset.id,
        name: result.preset.name,
        score: result.score,
      };
    }
  }

  return NextResponse.json({ success: true, data: presets, recommended });
}
