/**
 * ALAYA INSIDER — AI Task Queue (Redis-backed)
 */

import { getRedis } from '@/lib/search/redis/client';
import { AITask } from '../types';

const redis = getRedis();

export async function enqueueTask(task: Omit<AITask, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const id = `ai_task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const fullTask: AITask = {
    ...task,
    id,
    status: 'pending',
    createdAt: new Date(),
  };

  try {
    await redis.lpush('ai:task_queue', JSON.stringify(fullTask));
  } catch (err: any) {
    console.warn('[AI Queue] Enqueue failed (Redis unavailable) — task dropped gracefully:', err.message);
  }
  return id;
}

export async function dequeueTask(): Promise<AITask | null> {
  try {
    const raw = await redis.rpop('ai:task_queue');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function getQueueDepth(): Promise<number> {
  try {
    return redis.llen('ai:task_queue');
  } catch {
    return 0;
  }
}

export async function recordExecution(task: AITask) {
  await redis.lpush('ai:execution_history', JSON.stringify(task));
  await redis.ltrim('ai:execution_history', 0, 499); // keep last 500
}
