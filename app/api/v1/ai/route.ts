/**
 * Thin wrapper over the AI system (Phase 8) for v1 API consumers.
 */

import { NextRequest, NextResponse } from "next/server";
import { enqueueTask } from "@/lib/ai/jobs/queue";

export async function POST(req: NextRequest) {
  const { agentType, input } = await req.json();

  const taskId = await enqueueTask({
    agentType,
    input,
    priority: "normal",
    provider: "anthropic" as any,
    version: 1,
  });

  return NextResponse.json({ taskId, status: "queued" });
}
