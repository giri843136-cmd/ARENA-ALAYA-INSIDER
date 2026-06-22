/**
 * ALAYA INSIDER — Commission Splitting Service
 * Manages commission distribution when multiple parties are involved
 * in a referral (e.g., author + affiliate + platform).
 *
 * Supports configurable split rules, percentage-based or fixed-amount splits.
 */

import { prisma } from "@/lib/db/prisma";
import { logSecurityEvent } from "@/lib/backend/security/audit";
import { publishEvent } from "../events/eventBus";

// =============================================
// TYPES
// =============================================

export interface SplitRule {
  id: string;
  name: string;
  description?: string;
  splits: SplitEntry[];
  type: "percentage" | "fixed";
  isActive: boolean;
  createdAt: string;
}

export interface SplitEntry {
  recipientId: string;
  recipientType: "author" | "platform" | "affiliate_network" | "referrer";
  share: number; // Percentage (0-100) or fixed amount
}

export interface CommissionSplitResult {
  totalCommission: number;
  splits: {
    recipientId: string;
    recipientType: string;
    amount: number;
    share: number;
  }[];
  ruleName: string;
  calculatedAt: string;
}

// =============================================
// DEFAULT SPLIT RULES (stored in-app, extendable via DB)
// =============================================

const DEFAULT_SPLIT_RULES: SplitRule[] = [
  {
    id: "default-70-20-10",
    name: "Standard 70/20/10 Split",
    description: "70% to content author, 20% to affiliate network, 10% to platform",
    type: "percentage",
    isActive: true,
    createdAt: new Date().toISOString(),
    splits: [
      { recipientId: "author", recipientType: "author", share: 70 },
      { recipientId: "network", recipientType: "affiliate_network", share: 20 },
      { recipientId: "platform", recipientType: "platform", share: 10 },
    ],
  },
  {
    id: "default-80-20",
    name: "Author Preferred 80/20",
    description: "80% to content author, 20% to platform operational costs",
    type: "percentage",
    isActive: true,
    createdAt: new Date().toISOString(),
    splits: [
      { recipientId: "author", recipientType: "author", share: 80 },
      { recipientId: "platform", recipientType: "platform", share: 20 },
    ],
  },
  {
    id: "default-50-30-20",
    name: "Equal Distribution 50/30/20",
    description: "50% to author, 30% to referrer, 20% to platform",
    type: "percentage",
    isActive: true,
    createdAt: new Date().toISOString(),
    splits: [
      { recipientId: "author", recipientType: "author", share: 50 },
      { recipientId: "referrer", recipientType: "referrer", share: 30 },
      { recipientId: "platform", recipientType: "platform", share: 20 },
    ],
  },
];

// Store active rules (in production, persist to DB)
const customRules: SplitRule[] = [];

// =============================================
// SERVICE
// =============================================

/**
 * Get all available split rules (defaults + custom)
 */
export function getSplitRules(): SplitRule[] {
  return [...DEFAULT_SPLIT_RULES, ...customRules].filter((r) => r.isActive);
}

/**
 * Add a custom split rule
 */
export function addSplitRule(rule: Omit<SplitRule, "id" | "createdAt">): SplitRule {
  // Validate percentage splits sum to 100
  if (rule.type === "percentage") {
    const total = rule.splits.reduce((s, e) => s + e.share, 0);
    if (total !== 100) {
      throw new Error(`Percentage splits must sum to 100 (got ${total})`);
    }
  }

  const newRule: SplitRule = {
    ...rule,
    id: `custom-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  customRules.push(newRule);
  return newRule;
}

/**
 * Deactivate a split rule
 */
export function deactivateSplitRule(ruleId: string): boolean {
  const rule = [...DEFAULT_SPLIT_RULES, ...customRules].find((r) => r.id === ruleId);
  if (rule) {
    rule.isActive = false;
    return true;
  }
  return false;
}

/**
 * Calculate commission split for a given commission amount.
 */
export function calculateSplit(
  totalCommission: number,
  ruleId: string = "default-70-20-10"
): CommissionSplitResult {
  const rule = [...DEFAULT_SPLIT_RULES, ...customRules].find(
    (r) => r.id === ruleId && r.isActive
  );

  if (!rule) {
    throw new Error(`Split rule "${ruleId}" not found or inactive`);
  }

  const splits = rule.splits.map((entry) => {
    let amount: number;

    if (rule.type === "percentage") {
      amount = (totalCommission * entry.share) / 100;
    } else {
      // Fixed amount — share is the dollar amount
      amount = entry.share;
    }

    return {
      recipientId: entry.recipientId,
      recipientType: entry.recipientType,
      amount: Math.round(amount * 100) / 100,
      share: entry.share,
    };
  });

  return {
    totalCommission: Math.round(totalCommission * 100) / 100,
    splits,
    ruleName: rule.name,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Record a commission split event for audit
 */
export async function recordCommissionSplit(
  affiliateLinkId: string,
  commission: number,
  ruleId: string,
  productId?: string,
  userId?: string
): Promise<void> {
  const split = calculateSplit(commission, ruleId);

  await logSecurityEvent({
    action: "commission_split",
    details: JSON.stringify({
      affiliateLinkId,
      totalCommission: split.totalCommission,
      ruleId,
      ruleName: split.ruleName,
      splits: split.splits,
      productId,
    }),
    severity: "info",
  });

  await publishEvent("commission.split" as any, {
    affiliateLinkId,
    totalCommission: split.totalCommission,
    splits: split.splits,
    ruleName: split.ruleName,
    productId,
    userId,
  });
}

/**
 * Get commission summary for a time period (for admin dashboard)
 */
export async function getCommissionSummary(days: number = 30) {
  const since = new Date(Date.now() - days * 86400000);

  const events = await prisma.analyticsEvent.findMany({
    where: {
      name: "commission_split",
      timestamp: { gte: since },
    },
    select: {
      revenue: true,
      commission: true,
      timestamp: true,
      network: true,
    },
    orderBy: { timestamp: "desc" },
  });

  const totalCommission = events.reduce((s, e) => s + Number(e.commission || 0), 0);
  const byNetwork = new Map<string, number>();

  for (const event of events) {
    const net = event.network || "unknown";
    byNetwork.set(net, (byNetwork.get(net) || 0) + Number(event.commission || 0));
  }

  return {
    totalCommission: Math.round(totalCommission * 100) / 100,
    totalEvents: events.length,
    periodDays: days,
    byNetwork: Array.from(byNetwork.entries()).map(([network, amount]) => ({
      network,
      amount: Math.round(amount * 100) / 100,
    })),
    lastUpdated: new Date().toISOString(),
  };
}
