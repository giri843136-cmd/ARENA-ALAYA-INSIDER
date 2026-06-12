/**
 * AI Task API — Submit and manage AI work.
 */

import { NextRequest, NextResponse } from 'next/server';
import { enqueueTask } from '@/lib/ai/jobs/queue';
import { getAgentConfig, listAgents } from '@/lib/ai/agents/registry';
import { AgentType } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { agentType, input, priority = 'normal', userId } = body;

  if (!agentType || !input) {
    return NextResponse.json({ error: 'agentType and input required' }, { status: 400 });
  }

  const config = getAgentConfig(agentType as AgentType);
  if (!config) {
    return NextResponse.json({ error: 'Unknown agent' }, { status: 400 });
  }

  const taskId = await enqueueTask({
    agentType: agentType as AgentType,
    input,
    priority,
    provider: (config.defaultProvider === 'mock' ? 'anthropic' : config.defaultProvider) as any,
    userId,
    version: 1,
  });

  return NextResponse.json({ taskId, status: 'queued' });
}

export async function GET() {
  const agents = listAgents();
  return NextResponse.json({ agents });
}
