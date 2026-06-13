import { test, expect } from '@playwright/test';

test.describe('Product Page — Button Interactions', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/products/linen-duvet-cover-oat');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('Add to Cart button shows loading state then success state', async ({ page }) => {
    // Find the button by its CSS class (stable across state changes)
    const addBtn = page.locator('button.btn-primary').first();
    await expect(addBtn).toBeVisible();

    // Click and verify loading text appears
    await addBtn.click();
    await expect(addBtn).toContainText('Adding', { timeout: 3000 });

    // Wait for the success state
    await expect(addBtn).toContainText('Added to Cart', { timeout: 8000 });
  });

  test('Save to Wishlist button toggles state', async ({ page }) => {
    // Find the wishlist button by its container (second button in the grid below purchase card)
    const container = page.locator('#purchase-card .grid.grid-cols-2');
    const wishlistBtn = container.locator('button').last();
    await expect(wishlistBtn).toContainText(/Save to Wishlist|Saved/);

    // First click — should save
    await wishlistBtn.click();
    await expect(wishlistBtn).toContainText('♥ Saved', { timeout: 3000 });

    // Click again — should remove
    await wishlistBtn.click();
    await expect(wishlistBtn).toContainText('♡ Save to Wishlist', { timeout: 3000 });
  });

  test('Buy from Partner link opens in new tab', async ({ page }) => {
    const buyBtn = page.locator('a').filter({ hasText: /Buy from/ }).first();
    await expect(buyBtn).toBeVisible();

    const href = await buyBtn.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).toContain('http');

    const target = await buyBtn.getAttribute('target');
    expect(target).toBe('_blank');
  });

  test('Add to Compare link navigates correctly', async ({ page }) => {
    const compareBtn = page.locator('a').filter({ hasText: 'Add to Compare' }).first();
    await expect(compareBtn).toBeVisible();

    const href = await compareBtn.getAttribute('href');
    expect(href).toContain('/compare?add=');
  });

  test('Sticky price bar appears on scroll', async ({ page }) => {
    // Scroll to the very bottom of the page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);

    // The sticky bar should be visible — look for "Shop Now" in a fixed bar
    const shopNow = page.locator('button').filter({ hasText: 'Shop Now' }).last();
    await expect(shopNow).toBeVisible({ timeout: 8000 });
  });
});

test.describe('Product Page — Keyboard Shortcuts', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/products/linen-duvet-cover-oat');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('W key toggles wishlist', async ({ page }) => {
    const container = page.locator('#purchase-card .grid.grid-cols-2');
    const wishlistBtn = container.locator('button').last();
    await expect(wishlistBtn).toContainText(/Save to Wishlist|Saved/);

    // Press W to save
    await page.keyboard.press('w');
    await expect(wishlistBtn).toContainText('♥ Saved', { timeout: 3000 });

    // Press W to remove
    await page.keyboard.press('w');
    await expect(wishlistBtn).toContainText('♡ Save to Wishlist', { timeout: 3000 });
  });

  test('C key navigates to compare page', async ({ page }) => {
    await page.keyboard.press('c');
    await expect(page).toHaveURL(/\/compare\?add=/, { timeout: 5000 });
  });

  test('Keyboard shortcut badges are visible', async ({ page }) => {
    // Scroll to see the shortcut badges
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    await expect(page.locator('kbd').filter({ hasText: 'B' }).first()).toBeVisible({ timeout: 3000 });
    await expect(page.locator('kbd').filter({ hasText: 'W' }).first()).toBeVisible();
    await expect(page.locator('kbd').filter({ hasText: 'C' }).first()).toBeVisible();
  });
});

test.describe('Wishlist Page', () => {

  test.beforeEach(async ({ page }) => {
    // Initialize localStorage before any navigation to work around Firefox restrictions
    await page.context().addInitScript(() => {
      try {
        if (!localStorage.getItem('alaya_wishlist')) {
          localStorage.setItem('alaya_wishlist', '[]');
        }
      } catch {}
    });
  });

  test('wishlist page shows empty state', async ({ page }) => {
    await page.goto('/wishlist');
    await page.waitForLoadState('load');
    await expect(page.locator('h1')).toContainText('Your Wishlist');
    await expect(page.locator('text=Your wishlist is empty')).toBeVisible({ timeout: 10000 });
  });

  test('wishlist page shows saved items after adding from product page', async ({ page }) => {
    // Set wishlist data before page loads
    await page.context().addInitScript(() => {
      localStorage.setItem('alaya_wishlist', JSON.stringify([{
        slug: 'linen-duvet-cover-oat',
        name: 'Linen Duvet Cover — Oat',
        price: 248,
        image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519',
        brandName: 'Saunders & Lowe',
        addedAt: new Date().toISOString()
      }]));
    });

    await page.goto('/wishlist');
    await page.waitForLoadState('load');
    await expect(page.locator('h3').filter({ hasText: 'Duvet Cover' }).first()).toBeVisible({ timeout: 5000 });
  });
});
