/**
 * Nightly analytics job.
 * Run via cron: npx tsx scripts/analytics/daily.ts
 */

import { runDailyAggregations, runContentDecayDetection } from "@/lib/analytics/pipelines/aggregations";
import { evaluateAlerts } from "@/lib/analytics/alerts/service";

async function main() {
  console.log("[Analytics] Starting daily batch...");
  await runDailyAggregations();
  await runContentDecayDetection();
  await evaluateAlerts();
  console.log("[Analytics] Daily batch complete.");
}

main();
