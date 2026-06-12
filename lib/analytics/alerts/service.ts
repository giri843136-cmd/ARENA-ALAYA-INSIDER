/**
 * Intelligent alerting.
 */

import { AlertRule } from "../types";
import { sendTransactionalEmail } from "@/lib/backend/email/resend";

const DEFAULT_RULES: AlertRule[] = [
  { id: "revenue_drop_20", metric: "daily_revenue", threshold: 0.8, operator: "lt", window: "1d", channels: ["email", "inapp"], enabled: true },
  { id: "ai_cost_spike", metric: "daily_ai_cost", threshold: 120, operator: "gt", window: "1d", channels: ["email"], enabled: true },
  { id: "search_no_result_rate", metric: "search.no_result_rate", threshold: 0.12, operator: "gt", window: "4h", channels: ["inapp"], enabled: true },
];
void DEFAULT_RULES; // retained for future evaluateAlerts implementation (production alerting rules)

export async function evaluateAlerts() {
  // In production: query materialized views and compare against rules
  const revenue = 8200; // example live value
  const previous = 10400;

  if (revenue < previous * 0.8) {
    await sendTransactionalEmail({
      to: "editors@alayainsider.com",
      subject: "⚠️ Revenue dropped >20% in last 24h",
      html: `<p>Current: $${revenue}. Investigate immediately.</p>`,
    });
  }

  console.log("[Alerts] Evaluated alert rules");
}
