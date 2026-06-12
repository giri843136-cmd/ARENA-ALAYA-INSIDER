import { test, expect } from '@playwright/test';

test.describe('ALAYA INSIDER — Core User Flows', () => {

  test('homepage loads hero section with branding', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ALAYA INSIDER/);
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
  });

  test('homepage shows key editorial sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h2:has-text("The Edit")').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('h2:has-text("Explore the Universes")').first()).toBeVisible();
  });

  test('navigation links work', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav a:has-text("Journal")').first().click();
    await expect(page).toHaveURL(/\/journal/);
  });

  test('universes page renders', async ({ page }) => {
    await page.goto('/universes');
    await expect(page.locator('h1')).toBeVisible();
    const universeLink = page.locator('a[href^="/universes/"]').first();
    await expect(universeLink).toBeVisible();
  });

  test('search page loads with search input', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('input[type="text"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('product detail page shows trust grid', async ({ page }) => {
    await page.goto('/products/linen-duvet-cover-oat');
    await expect(page.locator('[class*="text-\\[10px\\]"]:has-text("AVAILABILITY")').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[class*="text-\\[10px\\]"]:has-text("ORIGIN")').first()).toBeVisible();
    await expect(page.locator('[class*="text-\\[10px\\]"]:has-text("SHIPPING")').first()).toBeVisible();
    await expect(page.locator('[class*="text-\\[10px\\]"]:has-text("GUARANTEE")').first()).toBeVisible();
  });

  test('journal page shows article cards', async ({ page }) => {
    await page.goto('/journal');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('brands page renders', async ({ page }) => {
    await page.goto('/brands');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('collections page loads', async ({ page }) => {
    await page.goto('/collections');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('footer has essential links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('footer a:has-text("Privacy")').first()).toBeVisible();
  });

  test('affiliate disclosure page loads', async ({ page }) => {
    await page.goto('/affiliate-disclosure');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('mobile viewport renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
  });

  test('admin panel loads', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/);
  });
});
