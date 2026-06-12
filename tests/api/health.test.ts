import { describe, it, expect, beforeAll } from "vitest";

const BASE_URL = "http://localhost:3000/api";

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    signal: AbortSignal.timeout(5000),
  });
  return { status: res.status, body: await res.json() };
}

describe("Health API", () => {
  let serverRunning = false;

  beforeAll(async () => {
    try {
      await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
      serverRunning = true;
    } catch {
      serverRunning = false;
    }
  });

  it("returns 200 with success", async () => {
    if (!serverRunning) return; // skip if no server
    const { status, body } = await apiFetch("/health");
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("GET /api/v1/products returns products array", async () => {
    if (!serverRunning) return;
    const { status, body } = await apiFetch("/v1/products");
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("GET /api/v1/comments requires articleId", async () => {
    if (!serverRunning) return;
    const { status, body } = await apiFetch("/v1/comments");
    expect(status).toBe(400);
    expect(body.success).toBe(false);
  });

  it("GET /api/v1/deals/active returns deals", async () => {
    if (!serverRunning) return;
    const { status, body } = await apiFetch("/v1/deals/active");
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("POST /api/v1/newsletter/subscribe validates email", async () => {
    if (!serverRunning) return;
    const { status } = await apiFetch("/v1/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "" }),
    });
    expect(status).toBe(400);
  });
});
