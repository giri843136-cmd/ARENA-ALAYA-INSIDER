/**
 * ALAYA INSIDER Mobile — Unified Search Service (text + voice + visual)
 * Calls the new multimodal backend while falling back gracefully.
 */

import { alaya } from '@alaya/insider-sdk'; // from Phase 13 SDK

export async function search(query: string, options?: { image?: string; voice?: boolean }) {
  if (options?.image) {
    // Visual search path
    return fetchMultimodal({ image: options.image, text: query });
  }
  if (options?.voice) {
    // Voice already transcribed on device or server
    return fetchMultimodal({ text: query, context: 'voice' });
  }
  // Standard text
  return alaya.search(query);
}

async function fetchMultimodal(payload: any) {
  // In real app: call /api/search/multimodal
  const res = await fetch('/api/search/multimodal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
