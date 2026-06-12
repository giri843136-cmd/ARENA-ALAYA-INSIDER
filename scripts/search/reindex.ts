/**
 * ALAYA INSIDER — Manual Reindex Script
 * Usage: npx tsx scripts/search/reindex.ts [--full]
 */

import { runFullReindex, runDeltaSync } from '@/lib/search/jobs/syncJob';

async function main() {
  const isFull = process.argv.includes('--full');
  console.log(`[Search Reindex] Starting ${isFull ? 'FULL' : 'DELTA'} reindex...`);

  if (isFull) {
    await runFullReindex();
  } else {
    await runDeltaSync();
  }

  console.log('[Search Reindex] Done.');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
