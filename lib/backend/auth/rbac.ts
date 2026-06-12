/**
 * ALAYA INSIDER — Role-Based Access Control (RBAC)
 * Fine-grained permissions with resource-level policies.
 */

import { Role, Permission } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

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
