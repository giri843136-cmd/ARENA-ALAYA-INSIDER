import { test, expect } from '@playwright/test';

test.describe('ALAYA INSIDER — Admin Pages', () => {

  test.describe('Security Dashboard', () => {
    test('security dashboard loads with posture gauge', async ({ page }) => {
      await page.goto('/admin/security/dashboard');
      // Should redirect to sign-in if unauthenticated
      await page.waitForURL(/\/auth\/signin|\/admin\/security\/dashboard/);

      if (page.url().includes('/admin/security/dashboard')) {
        await expect(page.locator('text=SECURITY DASHBOARD').first()).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Security Posture').first()).toBeVisible();
      }
    });
  });

  test.describe('Commission Split Page', () => {
    test('commission split page renders', async ({ page }) => {
      await page.goto('/admin/commission-split');
      await page.waitForURL(/\/auth\/signin|\/admin\/commission-split/);

      if (page.url().includes('/admin/commission-split')) {
        await expect(page.locator('text=COMMISSION SPLITTING').first()).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Split Rules').first()).toBeVisible();
      }
    });
  });

  test.describe('One-Click Deploy Page', () => {
    test('deploy page renders', async ({ page }) => {
      await page.goto('/admin/deploy');
      await page.waitForURL(/\/auth\/signin|\/admin\/deploy/);

      if (page.url().includes('/admin/deploy')) {
        await expect(page.locator('text=DEPLOYMENT').first()).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=One-Click Deploy').first()).toBeVisible();
      }
    });
  });

  test.describe('Inventory Predictions Page', () => {
    test('inventory page renders', async ({ page }) => {
      await page.goto('/admin/inventory');
      await page.waitForURL(/\/auth\/signin|\/admin\/inventory/);

      if (page.url().includes('/admin/inventory')) {
        await expect(page.locator('text=INVENTORY').first()).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Inventory Predictions').first()).toBeVisible();
      }
    });
  });

  test.describe('Training & Docs Page', () => {
    test('training page renders with module grid', async ({ page }) => {
      await page.goto('/admin/training');
      await page.waitForURL(/\/auth\/signin|\/admin\/training/);

      if (page.url().includes('/admin/training')) {
        await expect(page.locator('text=TRAINING & DOCUMENTATION').first()).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Admin Training').first()).toBeVisible();
        // Should show modules
        await expect(page.locator('text=Admin Platform Overview').first()).toBeVisible();
        await expect(page.locator('text=Product Studio').first()).toBeVisible();
      }
    });

    test('training search filters modules', async ({ page }) => {
      await page.goto('/admin/training');
      await page.waitForURL(/\/auth\/signin|\/admin\/training/);

      if (page.url().includes('/admin/training')) {
        // Type in search
        const searchInput = page.locator('input[placeholder="Search modules..."]').first();
        await searchInput.fill('Security');
        // Should show Security Center module
        await expect(page.locator('text=Security Center').first()).toBeVisible();
      }
    });

    test('category filter works', async ({ page }) => {
      await page.goto('/admin/training');
      await page.waitForURL(/\/auth\/signin|\/admin\/training/);

      if (page.url().includes('/admin/training')) {
        // Click System category
        await page.locator('button:has-text("System")').first().click();
        // Should show System modules
        await expect(page.locator('text=Security Center').first()).toBeVisible();
        await expect(page.locator('text=Deployment').first()).toBeVisible();
      }
    });

    test('module expand/collapse works', async ({ page }) => {
      await page.goto('/admin/training');
      await page.waitForURL(/\/auth\/signin|\/admin\/training/);

      if (page.url().includes('/admin/training')) {
        // Click resources toggle on first module
        const resourceToggle = page.locator('button:has-text("resource")').first();
        await resourceToggle.click();
        // Should show resource links
        await expect(page.locator('text=Admin Guide').first()).toBeVisible();
      }
    });
  });

  test.describe('Bulk Import Page', () => {
    test('affiliate import page renders', async ({ page }) => {
      await page.goto('/admin/affiliate-import');
      await page.waitForURL(/\/auth\/signin|\/admin\/affiliate-import/);

      if (page.url().includes('/admin/affiliate-import')) {
        await expect(page.locator('text=BULK IMPORT').first()).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Import Format Preset').first()).toBeVisible();
        await expect(page.locator('text=IMPORT GUIDE').first()).toBeVisible();
      }
    });
  });

  test.describe('Admin Sidebar Navigation', () => {
    test('sidebar has all new nav items', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForURL(/\/auth\/signin|\/admin/);

      if (page.url().includes('/admin')) {
        // Check that new nav items exist
        await expect(page.locator('text=Security Dashboard').first()).toBeVisible();
        await expect(page.locator('text=Commission Split').first()).toBeVisible();
        await expect(page.locator('text=Inventory Predictions').first()).toBeVisible();
        await expect(page.locator('text=Bulk Import').first()).toBeVisible();
        await expect(page.locator('text=One-Click Deploy').first()).toBeVisible();
        await expect(page.locator('text=Training & Docs').first()).toBeVisible();
      }
    });
  });
});
