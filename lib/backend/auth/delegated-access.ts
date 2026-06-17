/**
 * ALAYA INSIDER — Delegated Access Management
 * Primary admin (alayainsider@gmail.com) can grant/revoke access to other users.
 * Only the primary admin has full SUPER_ADMIN access.
 */

import { prisma } from "@/lib/db/prisma";
import type { Role } from "@prisma/client";

const PRIMARY_ADMIN_EMAIL = "alayainsider@gmail.com";

/**
 * Check if a user is the primary admin
 */
export function isPrimaryAdmin(email: string): boolean {
  return email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
}

/**
 * Grant delegated access to a user
 * Only the primary admin can do this
 */
export async function grantAccess(
  granterUserId: string,
  targetEmail: string,
  role: Role = "EDITOR",
  permissions: string[] = [],
  expiresAt?: Date
) {
  // Verify granter is primary admin
  const granter = await prisma.user.findUnique({ where: { id: granterUserId } });
  if (!granter || !isPrimaryAdmin(granter.email || "")) {
    throw new Error("Only the primary admin can grant access");
  }

  // Find or create the target user
  let targetUser = await prisma.user.findUnique({ where: { email: targetEmail } });
  if (!targetUser) {
    targetUser = await prisma.user.create({
      data: {
        email: targetEmail,
        name: targetEmail.split("@")[0],
      },
    });
  }

  // Create or update delegated access
  const access = await prisma.delegatedAccess.create({
    data: {
      grantedBy: granterUserId,
      grantedTo: targetUser.id,
      email: targetEmail,
      role,
      permissions,
      active: true,
      expiresAt,
    },
  });

  // Assign role to user
  await prisma.userRole.upsert({
    where: { userId_role: { userId: targetUser.id, role } },
    create: { userId: targetUser.id, role },
    update: {},
  });

  return access;
}

/**
 * Revoke delegated access
 */
export async function revokeAccess(accessId: string, granterUserId: string) {
  const granter = await prisma.user.findUnique({ where: { id: granterUserId } });
  if (!granter || !isPrimaryAdmin(granter.email || "")) {
    throw new Error("Only the primary admin can revoke access");
  }

  const access = await prisma.delegatedAccess.findUnique({ where: { id: accessId } });
  if (!access) throw new Error("Access record not found");

  // Deactivate
  await prisma.delegatedAccess.update({
    where: { id: accessId },
    data: { active: false },
  });

  return { revoked: true, email: access.email };
}

/**
 * List all delegated access records
 */
export async function listDelegatedAccess(granterUserId: string) {
  return prisma.delegatedAccess.findMany({
    where: { grantedBy: granterUserId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Check if a user has valid delegated access
 */
export async function hasDelegatedAccess(userId: string): Promise<boolean> {
  const access = await prisma.delegatedAccess.findFirst({
    where: {
      grantedTo: userId,
      active: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
  });
  return !!access;
}
