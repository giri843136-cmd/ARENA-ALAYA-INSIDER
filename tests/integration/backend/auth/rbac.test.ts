import { describe, it, expect } from 'vitest';
import { hasPermission } from '@/lib/backend/auth/rbac';

describe('RBAC', () => {
  it('super admin has all permissions', async () => {
    // In real tests we would seed a super admin user
    const allowed = await hasPermission('super-admin-id', 'MANAGE_SETTINGS');
    expect(allowed).toBe(true);
  });

  it('regular user cannot manage settings', async () => {
    const allowed = await hasPermission('regular-user-id', 'MANAGE_SETTINGS');
    expect(allowed).toBe(false);
  });
});
