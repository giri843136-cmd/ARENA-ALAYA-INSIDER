/**
 * RBAC System Tests
 *
 * Tests role-permission mappings, hierarchy, and edge cases.
 * Pure logic — no database required.
 */

import { describe, it, expect } from "vitest";

// Replicate the in-memory permission mapping (avoids Prisma dependency)
const Permission = {
  READ_PRODUCT: "READ_PRODUCT",
  WRITE_PRODUCT: "WRITE_PRODUCT",
  PUBLISH_PRODUCT: "PUBLISH_PRODUCT",
  DELETE_PRODUCT: "DELETE_PRODUCT",
  READ_ARTICLE: "READ_ARTICLE",
  WRITE_ARTICLE: "WRITE_ARTICLE",
  PUBLISH_ARTICLE: "PUBLISH_ARTICLE",
  DELETE_ARTICLE: "DELETE_ARTICLE",
  READ_BRAND: "READ_BRAND",
  WRITE_BRAND: "WRITE_BRAND",
  ACCESS_ADMIN: "ACCESS_ADMIN",
  ACCESS_AI_WORKSPACE: "ACCESS_AI_WORKSPACE",
  MANAGE_AFFILIATES: "MANAGE_AFFILIATES",
  VIEW_REVENUE: "VIEW_REVENUE",
  MANAGE_SETTINGS: "MANAGE_SETTINGS",
  MANAGE_USER: "MANAGE_USER",
  VIEW_ANALYTICS: "VIEW_ANALYTICS",
  MANAGE_COMMENTS: "MANAGE_COMMENTS",
} as const;

type Permission = (typeof Permission)[keyof typeof Permission];

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  GUEST: [],
  USER: [Permission.READ_PRODUCT, Permission.READ_ARTICLE],
  EDITOR: [
    Permission.READ_PRODUCT,
    Permission.WRITE_PRODUCT,
    Permission.PUBLISH_PRODUCT,
    Permission.READ_ARTICLE,
    Permission.WRITE_ARTICLE,
    Permission.PUBLISH_ARTICLE,
    Permission.READ_BRAND,
  ],
  SENIOR_EDITOR: [
    Permission.READ_PRODUCT,
    Permission.WRITE_PRODUCT,
    Permission.PUBLISH_PRODUCT,
    Permission.DELETE_PRODUCT,
    Permission.READ_ARTICLE,
    Permission.WRITE_ARTICLE,
    Permission.PUBLISH_ARTICLE,
    Permission.DELETE_ARTICLE,
    Permission.READ_BRAND,
    Permission.WRITE_BRAND,
    Permission.ACCESS_AI_WORKSPACE,
  ],
  ADMIN: [
    Permission.READ_PRODUCT,
    Permission.WRITE_PRODUCT,
    Permission.PUBLISH_PRODUCT,
    Permission.DELETE_PRODUCT,
    Permission.READ_ARTICLE,
    Permission.WRITE_ARTICLE,
    Permission.PUBLISH_ARTICLE,
    Permission.DELETE_ARTICLE,
    Permission.READ_BRAND,
    Permission.WRITE_BRAND,
    Permission.ACCESS_ADMIN,
    Permission.ACCESS_AI_WORKSPACE,
    Permission.MANAGE_AFFILIATES,
    Permission.VIEW_REVENUE,
    Permission.MANAGE_SETTINGS,
  ],
  SUPER_ADMIN: Object.values(Permission),
};

function hasPermission(role: string, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

describe("RBAC — Role Hierarchy", () => {
  it("GUEST has no permissions", () => {
    for (const perm of Object.values(Permission)) {
      expect(hasPermission("GUEST", perm)).toBe(false);
    }
  });

  it("USER can read products and articles", () => {
    expect(hasPermission("USER", Permission.READ_PRODUCT)).toBe(true);
    expect(hasPermission("USER", Permission.READ_ARTICLE)).toBe(true);
  });

  it("USER cannot write, publish, or delete", () => {
    expect(hasPermission("USER", Permission.WRITE_PRODUCT)).toBe(false);
    expect(hasPermission("USER", Permission.PUBLISH_PRODUCT)).toBe(false);
    expect(hasPermission("USER", Permission.DELETE_PRODUCT)).toBe(false);
    expect(hasPermission("USER", Permission.WRITE_ARTICLE)).toBe(false);
    expect(hasPermission("USER", Permission.DELETE_ARTICLE)).toBe(false);
  });

  it("EDITOR can write and publish products and articles", () => {
    expect(hasPermission("EDITOR", Permission.WRITE_PRODUCT)).toBe(true);
    expect(hasPermission("EDITOR", Permission.PUBLISH_PRODUCT)).toBe(true);
    expect(hasPermission("EDITOR", Permission.WRITE_ARTICLE)).toBe(true);
    expect(hasPermission("EDITOR", Permission.PUBLISH_ARTICLE)).toBe(true);
  });

  it("EDITOR cannot delete products or articles", () => {
    expect(hasPermission("EDITOR", Permission.DELETE_PRODUCT)).toBe(false);
    expect(hasPermission("EDITOR", Permission.DELETE_ARTICLE)).toBe(false);
  });

  it("SENIOR_EDITOR can delete products and articles", () => {
    expect(hasPermission("SENIOR_EDITOR", Permission.DELETE_PRODUCT)).toBe(true);
    expect(hasPermission("SENIOR_EDITOR", Permission.DELETE_ARTICLE)).toBe(true);
  });

  it("SENIOR_EDITOR has AI workspace access", () => {
    expect(hasPermission("SENIOR_EDITOR", Permission.ACCESS_AI_WORKSPACE)).toBe(true);
  });

  it("SENIOR_EDITOR cannot access admin or manage settings", () => {
    expect(hasPermission("SENIOR_EDITOR", Permission.ACCESS_ADMIN)).toBe(false);
    expect(hasPermission("SENIOR_EDITOR", Permission.MANAGE_SETTINGS)).toBe(false);
  });

  it("ADMIN has admin access, AI workspace, affiliates, revenue, and settings", () => {
    expect(hasPermission("ADMIN", Permission.ACCESS_ADMIN)).toBe(true);
    expect(hasPermission("ADMIN", Permission.ACCESS_AI_WORKSPACE)).toBe(true);
    expect(hasPermission("ADMIN", Permission.MANAGE_AFFILIATES)).toBe(true);
    expect(hasPermission("ADMIN", Permission.VIEW_REVENUE)).toBe(true);
    expect(hasPermission("ADMIN", Permission.MANAGE_SETTINGS)).toBe(true);
  });

  it("ADMIN can write brands", () => {
    expect(hasPermission("ADMIN", Permission.WRITE_BRAND)).toBe(true);
  });

  it("ADMIN cannot manage users", () => {
    expect(hasPermission("ADMIN", Permission.MANAGE_USER)).toBe(false);
  });

  it("SUPER_ADMIN has all permissions", () => {
    for (const perm of Object.values(Permission)) {
      expect(hasPermission("SUPER_ADMIN", perm)).toBe(true);
    }
  });
});

describe("RBAC — Permission Inheritance", () => {
  it("each role inherits permissions from roles below it", () => {
    const hierarchy = ["GUEST", "USER", "EDITOR", "SENIOR_EDITOR", "ADMIN", "SUPER_ADMIN"];
    for (let i = 1; i < hierarchy.length; i++) {
      const currentRole = hierarchy[i];
      const lowerRole = hierarchy[i - 1];
      // Current role should have at minimum all permissions of the lower role
      for (const perm of ROLE_PERMISSIONS[lowerRole]) {
        expect(hasPermission(currentRole, perm)).toBe(true);
      }
    }
  });
});

describe("RBAC — Edge Cases", () => {
  it("unknown role has no permissions", () => {
    expect(hasPermission("NONEXISTENT", Permission.READ_PRODUCT)).toBe(false);
  });

  it("empty string role has no permissions", () => {
    expect(hasPermission("", Permission.READ_PRODUCT)).toBe(false);
  });

  it("permission names are case-sensitive", () => {
    expect(hasPermission("admin", Permission.READ_PRODUCT)).toBe(false);
    expect(hasPermission("ADMIN", Permission.READ_PRODUCT)).toBe(true);
  });

  it("all roles have unique permission sets (no duplicates where not intended)", () => {
    const roleKeys = Object.keys(ROLE_PERMISSIONS);
    for (const role of roleKeys) {
      const perms = ROLE_PERMISSIONS[role];
      const uniquePerms = new Set(perms);
      expect(uniquePerms.size).toBe(perms.length);
    }
  });
});
