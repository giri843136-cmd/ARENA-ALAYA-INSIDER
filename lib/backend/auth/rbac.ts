/**
 * ALAYA INSIDER — Role-Based Access Control (RBAC)
 * Fine-grained permissions with resource-level policies.
 */

import { Role, Permission } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { isPrimaryAdmin } from "@/lib/backend/auth/delegated-access";

const ROLE_RANK: Record<Role, number> = {
  GUEST: 0,
  USER: 1,
  EDITOR: 2,
  SENIOR_EDITOR: 3,
  ADMIN: 4,
  SUPER_ADMIN: 5,
};

/** Highest role from UserRole rows; primary admin is always SUPER_ADMIN. */
export async function resolveSessionRole(
  userId: string,
  email?: string | null
): Promise<Role> {
  if (email && isPrimaryAdmin(email)) {
    return "SUPER_ADMIN";
  }

  const roles = await prisma.userRole.findMany({
    where: { userId },
    select: { role: true },
  });

  if (roles.length === 0) {
    return "USER";
  }

  return roles.reduce(
    (highest, { role }) => (ROLE_RANK[role] > ROLE_RANK[highest] ? role : highest),
    roles[0].role
  );
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  GUEST: [],
  USER: ["READ_PRODUCT", "READ_ARTICLE"],
  EDITOR: [
    "READ_PRODUCT", "WRITE_PRODUCT", "PUBLISH_PRODUCT",
    "READ_ARTICLE", "WRITE_ARTICLE", "PUBLISH_ARTICLE",
    "READ_BRAND",
  ],
  SENIOR_EDITOR: [
    "READ_PRODUCT", "WRITE_PRODUCT", "PUBLISH_PRODUCT", "DELETE_PRODUCT",
    "READ_ARTICLE", "WRITE_ARTICLE", "PUBLISH_ARTICLE", "DELETE_ARTICLE",
    "READ_BRAND", "WRITE_BRAND",
    "ACCESS_AI_WORKSPACE",
  ],
  ADMIN: [
    "READ_PRODUCT", "WRITE_PRODUCT", "PUBLISH_PRODUCT", "DELETE_PRODUCT",
    "READ_ARTICLE", "WRITE_ARTICLE", "PUBLISH_ARTICLE", "DELETE_ARTICLE",
    "READ_BRAND", "WRITE_BRAND",
    "ACCESS_ADMIN", "ACCESS_AI_WORKSPACE", "MANAGE_AFFILIATES",
    "VIEW_REVENUE", "MANAGE_SETTINGS",
  ],
  SUPER_ADMIN: Object.values(Permission),
};

export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    select: { role: true },
  });

  const permissions = new Set<Permission>();
  for (const { role } of userRoles) {
    ROLE_PERMISSIONS[role]?.forEach(p => permissions.add(p));
  }

  return permissions.has(permission);
}

export async function requirePermission(userId: string, permission: Permission) {
  const allowed = await hasPermission(userId, permission);
  if (!allowed) {
    throw new Error(`Forbidden: Missing permission ${permission}`);
  }
}

export async function canImpersonate(userId: string): Promise<boolean> {
  return hasPermission(userId, "MANAGE_USER");
}
