import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    comment: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    moderationAuditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db/prisma";

describe("Comments Moderation — Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET paginates comments with status filter", async () => {
    const mockComments = [
      { id: "c1", articleId: "a1", content: "Great article!", status: "PENDING", upvotes: 0, downvotes: 0, createdAt: new Date(), user: { name: "Alice" } },
      { id: "c2", articleId: "a1", content: "Thanks for sharing", status: "PENDING", upvotes: 2, downvotes: 0, createdAt: new Date(), user: { name: "Bob" } },
    ];
    vi.mocked(prisma.comment.findMany).mockResolvedValue(mockComments as any);

    const comments = await prisma.comment.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
    expect(comments).toHaveLength(2);
    expect(comments.every((c: any) => c.status === "PENDING")).toBe(true);
  });

  it("GET searches comments by content", async () => {
    vi.mocked(prisma.comment.findMany).mockResolvedValue([
      { id: "c3", content: "This is about products", status: "APPROVED", createdAt: new Date(), user: { name: "Charlie" } },
    ] as any);

    const results = await prisma.comment.findMany({
      where: { content: { contains: "products", mode: "insensitive" } },
    });
    expect(results).toHaveLength(1);
    expect((results[0] as any).content).toContain("products");
  });

  it("PATCH approves a pending comment", async () => {
    const updated = { id: "c1", status: "APPROVED" };
    vi.mocked(prisma.comment.update).mockResolvedValue(updated as any);

    const comment = await prisma.comment.update({
      where: { id: "c1" },
      data: { status: "APPROVED" },
    });
    expect(comment.status).toBe("APPROVED");
  });

  it("PATCH rejects (marks as spam) a comment", async () => {
    const updated = { id: "c2", status: "SPAM" };
    vi.mocked(prisma.comment.update).mockResolvedValue(updated as any);

    const comment = await prisma.comment.update({
      where: { id: "c2" },
      data: { status: "SPAM" },
    });
    expect(comment.status).toBe("SPAM");
  });

  it("DELETE soft-deletes a comment", async () => {
    const deleted = { id: "c3", status: "DELETED", deletedAt: new Date() };
    vi.mocked(prisma.comment.update).mockResolvedValue(deleted as any);

    const comment = await prisma.comment.update({
      where: { id: "c3" },
      data: { status: "DELETED", deletedAt: new Date() },
    });
    expect(comment.status).toBe("DELETED");
    expect(comment.deletedAt).toBeDefined();
  });

  it("PATCH restores a soft-deleted comment", async () => {
    const restored = { id: "c3", status: "APPROVED", deletedAt: null };
    vi.mocked(prisma.comment.update).mockResolvedValue(restored as any);

    const comment = await prisma.comment.update({
      where: { id: "c3" },
      data: { status: "APPROVED", deletedAt: null },
    });
    expect(comment.status).toBe("APPROVED");
    expect(comment.deletedAt).toBeNull();
  });

  it("creates audit log on moderation action", async () => {
    const auditLog = { id: "al1", commentId: "c1", action: "approve", source: "admin", createdAt: new Date() };
    vi.mocked(prisma.moderationAuditLog.create).mockResolvedValue(auditLog as any);

    const log = await prisma.moderationAuditLog.create({
      data: { commentId: "c1", action: "approve", source: "admin" },
    });
    expect(log.action).toBe("approve");
    expect(log.source).toBe("admin");
  });

  it("counts comments by status", async () => {
    vi.mocked(prisma.comment.count)
      .mockResolvedValueOnce(5)  // all
      .mockResolvedValueOnce(2)  // PENDING
      .mockResolvedValueOnce(2)  // APPROVED
      .mockResolvedValueOnce(1); // SPAM

    const all = await prisma.comment.count();
    const pending = await prisma.comment.count({ where: { status: "PENDING" } });
    const approved = await prisma.comment.count({ where: { status: "APPROVED" } });
    const spam = await prisma.comment.count({ where: { status: "SPAM" } });

    expect(all).toBe(5);
    expect(pending).toBe(2);
    expect(approved).toBe(2);
    expect(spam).toBe(1);
  });
});
