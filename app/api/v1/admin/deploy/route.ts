import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { logSecurityEvent } from "@/lib/backend/security/audit";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/backend/security/rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface DeployConfig {
  githubRepo?: string;
  githubBranch?: string;
  githubWorkflow?: string;
  deployHookUrl?: string;
}

// In production, load from env or DB settings
function getDeployConfig(): DeployConfig {
  return {
    githubRepo: process.env.GITHUB_REPO,
    githubBranch: process.env.GITHUB_BRANCH || "main",
    githubWorkflow: process.env.GITHUB_DEPLOY_WORKFLOW || "deploy.yml",
    deployHookUrl: process.env.DEPLOY_HOOK_URL,
  };
}

/**
 * Get deployment status
 */
export async function GET(request: NextRequest) {
  try {
    const rlId = getRateLimitIdentifier(request);
    const rl = await checkRateLimit(rlId, "admin");
    if (!rl.allowed) return NextResponse.json({ success: false, error: { code: "RATE_LIMITED" } }, { status: 429 });
    const config = getDeployConfig();
    const hasDeployHook = !!config.deployHookUrl;
    const hasGitHubConfig = !!config.githubRepo;

    // Get recent deploy logs
    const recentDeploys = await prisma.cronLog.findMany({
      where: { jobName: "deploy" },
      orderBy: { startedAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: {
        configured: hasDeployHook || hasGitHubConfig,
        config: {
          repo: config.githubRepo || null,
          branch: config.githubBranch,
          workflow: config.githubWorkflow,
          hasDeployHook: hasDeployHook,
        },
        recentDeploys: recentDeploys.map((d) => ({
          id: d.id,
          status: d.status,
          startedAt: d.startedAt.toISOString(),
          finishedAt: d.finishedAt?.toISOString() || null,
          error: d.error,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

/**
 * Trigger a deployment via webhook or GitHub workflow dispatch
 */
export async function POST(request: NextRequest) {
  try {
    const rlId = getRateLimitIdentifier(request);
    const rl = await checkRateLimit(rlId, "admin");
    if (!rl.allowed) return NextResponse.json({ success: false, error: { code: "RATE_LIMITED" } }, { status: 429 });
    const config = getDeployConfig();
    const body = await request.json().catch(() => ({}));
    const branch = body.branch || config.githubBranch || "main";

    // Log the deploy attempt
    const deployLog = await prisma.cronLog.create({
      data: {
        jobName: "deploy",
        startedAt: new Date(),
        status: "processing",
      },
    });

    let deployResult: { success: boolean; message: string };

    if (config.deployHookUrl) {
      // Webhook-based deploy (e.g., Vercel, Render, Railway)
      try {
        const response = await fetch(config.deployHookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branch }),
        });

        if (response.ok) {
          deployResult = {
            success: true,
            message: `Deploy triggered via webhook (branch: ${branch})`,
          };
        } else {
          deployResult = {
            success: false,
            message: `Webhook returned ${response.status}: ${response.statusText}`,
          };
        }
      } catch (err: any) {
        deployResult = {
          success: false,
          message: `Webhook call failed: ${err.message}`,
        };
      }
    } else if (config.githubRepo) {
      // GitHub workflow dispatch
      deployResult = {
        success: false,
        message: `GitHub Actions dispatch not configured. Set GITHUB_TOKEN in environment to enable.`,
      };
    } else {
      deployResult = {
        success: false,
        message: "No deploy hook URL or GitHub repo configured. Set DEPLOY_HOOK_URL or GITHUB_REPO in environment.",
      };
    }

    // Update deploy log
    await prisma.cronLog.update({
      where: { id: deployLog.id },
      data: {
        status: deployResult.success ? "success" : "failed",
        finishedAt: new Date(),
        error: deployResult.success ? null : deployResult.message,
      },
    });

    // Audit log
    await logSecurityEvent({
      action: deployResult.success ? "deploy_triggered" : "deploy_failed",
      details: `One-click deploy to ${branch}: ${deployResult.message}`,
      severity: deployResult.success ? "info" : "warning",
    });

    return NextResponse.json({
      success: deployResult.success,
      data: {
        message: deployResult.message,
        deployLogId: deployLog.id,
        branch,
        triggeredAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "DEPLOY_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
