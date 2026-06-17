/**
 * ALAYA INSIDER — CSP Violation Reporting Endpoint
 * Collects CSP violations for monitoring without breaking the app
 */

import { NextRequest, NextResponse } from "next/server";
import { logSecurityEvent } from "@/lib/backend/security/audit";

export async function POST(request: NextRequest) {
  try {
    const report = await request.json();
    const cspReport = report["csp-report"] || report;
    
    // Log the violation for monitoring
    await logSecurityEvent({
      action: "csp_violation",
      details: JSON.stringify({
        blockedUri: cspReport["blocked-uri"] || "unknown",
        violatedDirective: cspReport["violated-directive"] || "unknown",
        originalPolicy: cspReport["original-policy"]?.substring(0, 200) || "unknown",
        sourceFile: cspReport["source-file"] || "unknown",
        lineNumber: cspReport["line-number"] || "unknown",
        columnNumber: cspReport["column-number"] || "unknown",
        disposition: cspReport.disposition || "report",
      }),
      severity: "warning",
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Silently ignore malformed reports
    return NextResponse.json({ ok: true });
  }
}
