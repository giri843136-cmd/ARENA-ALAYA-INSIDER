import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hasPermission } from '@/lib/backend/auth/rbac';

// Mock the Prisma client so we don't need a real DB
vi.mock('@/lib/db/prisma', () => {
  const mockUserRoleFindMany = vi.fn();

  return {
    prisma: {
      userRole: {
        findMany: mockUserRoleFindMany,
      },
    },
    default: {
      userRole: {
        findMany: mockUserRoleFindMany,
      },
    },
  };
});

import { prisma } from '@/lib/db/prisma';

describe('RBAC', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('super admin has all permissions', async () => {
    (prisma.userRole.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { role: 'SUPER_ADMIN' },
    ]);

    const allowed = await hasPermission('super-admin-id', 'MANAGE_SETTINGS');
    expect(allowed).toBe(true);
  });

  it('regular user cannot manage settings', async () => {
    (prisma.userRole.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { role: 'USER' },
    ]);

    const allowed = await hasPermission('regular-user-id', 'MANAGE_SETTINGS');
    expect(allowed).toBe(false);
  });
});
