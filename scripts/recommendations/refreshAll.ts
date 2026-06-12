/**
 * Manual full recommendation refresh script.
 * npx tsx scripts/recommendations/refreshAll.ts
 */

import { fullGraphRefresh, refreshTrendingRecommendations } from '@/lib/recommendations/jobs/refreshJobs';

async function main() {
  console.log('Starting full recommendation engine refresh...');
  await fullGraphRefresh();
  await refreshTrendingRecommendations();
  console.log('Recommendation refresh complete.');
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
