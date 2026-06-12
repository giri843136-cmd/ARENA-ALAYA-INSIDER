/**
 * ALAYA INSIDER — AI Memory System
 * Multi-scope memory for agents (long-term knowledge + short-term context).
 */

import { prisma } from '@/lib/db/prisma';
import { getRedis } from '@/lib/search/redis/client';
import { MemoryEntry } from '../types';

const redis = getRedis();

export class MemoryManager {
  async storeMemory(entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const id = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    // Persist to DB for durability (graceful)
    await prisma.aIHistory.create({
      data: {
        id,
        action: 'CONTENT_ARCHITECT' as any,
        prompt: `scope:${entry.scope} key:${entry.key}`,
        output: JSON.stringify(entry.value),
        model: 'memory',
      },
    }).catch(() => {});

    // Hot cache in Redis (graceful)
    try {
      const key = `ai:memory:${entry.scope}:${entry.key}`;
      await redis.setex(key, 60 * 60 * 24 * 7, JSON.stringify(entry.value));
    } catch {
      // Redis down - memory still persisted to DB above
    }
  }

  async getRelevantMemory(agentType: string, _input: any): Promise<any> { // _input kept for future agent-specific memory scoping
    void _input;
    const key = `ai:memory:agent:${agentType}`;
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);

    // Fallback to recent AI history
    const recent = await prisma.aIHistory.findMany({
      where: { action: { in: ['CONTENT_ARCHITECT', 'SEO_STRATEGIST', 'TREND_RADAR'] as any } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return { recentSummaries: recent.map(r => r.output?.slice(0, 300)) };
  }

  async getGlobalKnowledge(key: string) {
    const cached = await redis.get(`ai:memory:global:${key}`);
    return cached ? JSON.parse(cached) : null;
  }
}

export const memoryManager = new MemoryManager();
