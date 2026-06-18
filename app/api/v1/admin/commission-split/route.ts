import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/backend/security/rate-limiter";
import {
  getSplitRules,
  addSplitRule,
  deactivateSplitRule,
  calculateSplit,
  recordCommissionSplit,
  getCommissionSummary,
} from "@/lib/backend/affiliate/commission-splitting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const rlId = getRateLimitIdentifier(request);
    const rl = await checkRateLimit(rlId, "admin");
    if (!rl.allowed) return NextResponse.json({ success: false, error: { code: "RATE_LIMITED" } }, { status: 429 });
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "rules";
    const days = parseInt(searchParams.get("days") || "30");

    switch (mode) {
      case "rules":
        return NextResponse.json({ success: true, data: getSplitRules() });

      case "summary":
        const summary = await getCommissionSummary(days);
        return NextResponse.json({ success: true, data: summary });

      case "calculate": {
        const commission = parseFloat(searchParams.get("commission") || "0");
        const ruleId = searchParams.get("ruleId") || "default-70-20-10";
        const split = calculateSplit(commission, ruleId);
        return NextResponse.json({ success: true, data: split });
      }

      default:
        return NextResponse.json(
          { success: false, error: { code: "INVALID_MODE", message: "Mode must be: rules, summary, or calculate" } },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const rlId = getRateLimitIdentifier(request);
    const rl = await checkRateLimit(rlId, "admin");
    if (!rl.allowed) return NextResponse.json({ success: false, error: { code: "RATE_LIMITED" } }, { status: 429 });
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "create_rule": {
        const rule = addSplitRule(body.rule);
        return NextResponse.json({ success: true, data: rule }, { status: 201 });
      }

      case "deactivate_rule": {
        const deactivated = deactivateSplitRule(body.ruleId);
        if (!deactivated) {
          return NextResponse.json(
            { success: false, error: { code: "NOT_FOUND", message: "Rule not found" } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true });
      }

      case "record_split": {
        await recordCommissionSplit(
          body.affiliateLinkId,
          body.commission,
          body.ruleId || "default-70-20-10",
          body.productId,
          body.userId
        );
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { success: false, error: { code: "INVALID_ACTION", message: "Action must be: create_rule, deactivate_rule, or record_split" } },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "COMMISSION_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
