/**
 * ALAYA INSIDER Mobile — AI Shopping Assistant Service
 * Maintains conversational state and memory.
 */

import { alaya } from '@alaya/insider-sdk';

let currentSessionId: string | null = null;

export async function sendMessage(message: string, context?: any) {
  // In real implementation: call backend conversational endpoint
  // which orchestrates existing AI agents + new conversation memory
  const response = await fetch('/api/ai/assistant', {
    method: 'POST',
    body: JSON.stringify({ message, sessionId: currentSessionId, context }),
  });
  const data = await response.json();
  currentSessionId = data.sessionId;
  return data;
}

export async function startNewSession() {
  currentSessionId = null;
}
