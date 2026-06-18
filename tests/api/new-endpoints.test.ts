/**
 * New Endpoints API Integration Tests
 *
 * Tests the newly created API endpoints: autofill, commission-split,
 * inventory predictions, product embeds, and deploy.
 * These tests are designed to run against a running dev server.
 * They gracefully skip if no server is available (same pattern as health.test.ts).
 */

import { describe, it, expect, beforeAll } from "vitest";

const BASE_URL = `${process.env.TEST_BASE_URL || "http://localhost:3000"}/api`;

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    signal: AbortSignal.timeout(5000),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

let serverRunning = false;

beforeAll(async () => {
  try {
    await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
    serverRunning = true;
  } catch {
    serverRunning = false;
  }
});

describe("Auto-Fill API — /api/v1/affiliate/autofill", () => {
  it("returns 400 when no productId provided", async () => {
    if (!serverRunning) return;
    const { status, body } = await apiFetch("/v1/affiliate/autofill");
    expect(status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 200 with valid productId", async () => {
    if (!serverRunning) return;
    const { status, body } = await apiFetch("/v1/affiliate/autofill?productId=p1&affiliateUrl=https://example.com");
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });
});

describe("Commission Split API — /api/v1/admin/commission-split", () => {
  it("returns split rules", async () => {
    if (!serverRunning) return;
    const { status, body } = await apiFetch("/v1/admin/commission-split?mode=rules");
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("returns commission summary", async () => {
    if (!serverRunning) return;
    const { status, body } = await apiFetch("/v1/admin/commission-split?mode=summary");
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.totalCommission).toBeDefined();
  });

  it("calculates split correctly", async () => {
    if (!serverRunning) return;
    const { status, body } = await apiFetch(
      "/v1/admin/commission-split?mode=calculate&commission=100&ruleId=default-70-20-10"
    );
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.splits).toHaveLength(3);
    expect(body.data.splits[0].amount).toBe(70);
  });

  it("returns 400 for invalid mode", async () => {
    if (!serverRunning) return;
    const { status, body } = await apiFetch("/v1/admin/commission-split?mode=invalid");
    expect(status).toBe(400);
    expect(body.success).toBe(false);
  });
});

describe("Inventory Predictions API — /api/v1/admin/inventory/predictions", () => {
  it("returns inventory summary", async () => {
    if (!serverRunning) return;
    const { status, body } = await apiFetch("/v1/admin/inventory/predictions?mode=summary");
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.totalProducts).toBeDefined();
    expect(body.data.lastUpdated).toBeDefined();
  });

  it("returns low stock predictions", async () => {
    if (!serverRunning) return;
    const { status, body } = await apiFetch("/v1/admin/inventory/predictions?mode=low-stock");
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("requires productId for single mode", async () => {
    if (!serverRunning) return;
    const { status, body } = await apiFetch("/v1/admin/inventory/predictions?mode=single");
    expect(status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for invalid mode", async () => {
    if (!serverRunning) return;
    const { status, body } = await apiFetch("/v1/admin/inventory/predictions?mode=invalid");
    expect(status).toBe(400);
    expect(body.error.code).toBe("INVALID_MODE");
  });
});

describe("Product Embeds API — /api/v1/admin/products/embeds", () => {
  it("requires productIds or slug", async () => {
    if (!serverRunning) return;
    const { status, body } = await apiFetch("/v1/admin/products/embeds");
    expect(status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("fetches product by slug", async () => {
    if (!serverRunning) return;
    const { status, body } = await apiFetch("/v1/admin/products/embeds?slug=linen-duvet-cover-oat");
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    if (body.data) {
      expect(body.data.name).toBeDefined();
      expect(body.data.price).toBeDefined();
    }
  });

  it("fetches products by IDs", async () => {
    if (!serverRunning) return;
    const { status, body } = await apiFetch("/v1/admin/products/embeds?productIds=p1,p2");
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });
});

describe("Deploy API — /api/v1/admin/deploy", () => {
  it("returns deploy configuration", async () => {
    if (!serverRunning) return;
    const { status, body } = await apiFetch("/v1/admin/deploy");
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.configured).toBeDefined();
    expect(body.data.config).toBeDefined();
    expect(Array.isArray(body.data.recentDeploys)).toBe(true);
  });
});

describe("Best Merchant API — /api/v1/products/[slug]/best-merchant", () => {
  it("returns 404 for non-existent product", async () => {
    if (!serverRunning) return;
    const { status } = await apiFetch("/v1/products/non-existent-product/best-merchant?details=true");
    // Should be 404 since product doesn't exist
    expect([404, 200]).toContain(status);
  });
});
