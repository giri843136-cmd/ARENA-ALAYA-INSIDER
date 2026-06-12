/**
 * AI Worker — Processes the task queue.
 * Run as a background process or via cron/inngest.
 */

import { dequeueTask, recordExecution } from './queue';
import { getAgent } from '../agents';
import { memoryManager } from '../memory/memoryManager';

export async function processNextTask() {
  try {
    const task = await dequeueTask();
    if (!task) return;

    const agent = getAgent(task.agentType);
    if (!agent) {
      task.status = 'failed';
      task.error = 'Agent not found';
      await recordExecution(task).catch(() => {});
      return;
    }

    const result = await agent.execute(task.input, task.userId);
    await recordExecution(result).catch(() => {});

    // Store important outputs in memory (graceful)
    if (result.status === 'completed' && result.output) {
      await memoryManager.storeMemory({
        scope: 'global',
        key: `last_${task.agentType}`,
        value: result.output,
      }).catch(() => {});
    }
  } catch (e: any) {
    console.warn('[AI Worker] Task processing failed gracefully (AI service degraded):', e.message);
  }
}

export async function runWorkerLoop() {
  console.log('[AI Worker] Starting...');
  setInterval(async () => {
    try {
      await processNextTask();
    } catch (e) {
      console.warn('[AI Worker] Loop error (non-fatal):', (e as any).message);
    }
  }, 1500);
}
