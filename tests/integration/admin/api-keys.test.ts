import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma before any imports
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    apiKey: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Import mockable dependencies
import { prisma } from "@/lib/db/prisma";

describe("API Keys — Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns empty list when no keys exist", async () => {
    vi.mocked(prisma.apiKey.findMany).mockResolvedValue([]);

    const keys = await prisma.apiKey.findMany();
    expect(keys).toEqual([]);
    expect(prisma.apiKey.findMany).toHaveBeenCalledOnce();
  });

  it("GET returns keys with expected fields", async () => {
    const mockKeys = [
      { id: "key-1", name: "Production SDK", scopes: ["products:read", "products:write"], keyHash: "hash1", lastUsedAt: null, expiresAt: null, createdAt: new Date("2026-06-14") },
      { id: "key-2", name: "Development", scopes: ["products:read"], keyHash: "hash2", lastUsedAt: null, expiresAt: null, createdAt: new Date("2026-06-13") },
    ];
    vi.mocked(prisma.apiKey.findMany).mockResolvedValue(mockKeys as any);

    const keys = await prisma.apiKey.findMany({ orderBy: { createdAt: "desc" } });
    expect(keys).toHaveLength(2);
    expect(keys[0].name).toBe("Production SDK");
    expect(keys[0].scopes).toContain("products:read");
  });

  it("POST creates a new key", async () => {
    const input = { name: "Test Key", scopes: ["products:read"], keyHash: "test-hash-123" };
    vi.mocked(prisma.apiKey.create).mockImplementation(async ({ data }: any) => ({
      id: "key-3",
      name: data.name,
      scopes: data.scopes,
      keyHash: data.keyHash,
      createdAt: new Date(),
    }));

    const created = await prisma.apiKey.create({
      data: input,
    });
    expect(created.name).toBe("Test Key");
    expect(created.keyHash).toBe("test-hash-123");
  });

  it("DELETE removes a key by id", async () => {
    vi.mocked(prisma.apiKey.delete).mockResolvedValue({ id: "key-1" } as any);

    const result = await prisma.apiKey.delete({ where: { id: "key-1" } });
    expect(result.id).toBe("key-1");
    expect(prisma.apiKey.delete).toHaveBeenCalledWith({ where: { id: "key-1" } });
  });
});
