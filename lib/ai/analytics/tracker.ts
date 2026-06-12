/**
 * AI Analytics Tracker
 */

import { prisma } from '@/lib/db/prisma';
import { AITask } from '../types';

export async function trackExecution(task: AITask) {
  await prisma.aIHistory.create({
    data: {
      id: task.id,
      userId: task.userId,
      action: task.agentType as any, // align to Prisma AIAction enum
      prompt: JSON.stringify(task.input),
      output: JSON.stringify((task as any).output || ''),
      model: (task as any).model,
      version: task.version,
      metadata: {
        tokens: (task as any).tokensUsed,
        cost: (task as any).costUsd,
        latency: (task as any).executionTimeMs,
        provider: task.provider,
        status: task.status,
      },
    },
  }).catch(() => {});
}

export async function getAIAnalytics(): Promise<any> {
  const history = await prisma.aIHistory.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const totalCost = history.reduce((sum, h) => sum + ((h.metadata as any)?.cost || 0), 0);
  const totalTokens = history.reduce((sum, h) => sum + ((h.metadata as any)?.tokens || 0), 0);

  return {
    totalExecutions: history.length,
    totalCostUsd: totalCost,
    totalTokens,
    recent: history.slice(0, 20).map(h => ({
      action: h.action,
      cost: (h.metadata as any)?.cost,
      latency: (h.metadata as any)?.latency,
      createdAt: h.createdAt,
    })),
  };
}
