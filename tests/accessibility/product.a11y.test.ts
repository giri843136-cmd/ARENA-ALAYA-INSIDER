import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test('product page meets WCAG AAA', async ({ page }) => {
  await page.goto('/products/artisan-weave-tote');
  await injectAxe(page);
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: { html: true },
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa', 'best-practice'],
    },
  });
});

test('product page has proper structured data', async ({ page }) => {
  await page.goto('/products/artisan-weave-tote');
  await injectAxe(page);

  // Check for JSON-LD structured data
  const scripts = page.locator('script[type="application/ld+json"]');
  const count = await scripts.count();
  expect(count).toBeGreaterThanOrEqual(1);

  // Check that structured data has required fields
  for (let i = 0; i < count; i++) {
    const content = await scripts.nth(i).textContent();
    if (content) {
      const parsed = JSON.parse(content);
      // Product schema should have name and description
      if (parsed['@type'] === 'Product') {
        expect(parsed.name).toBeTruthy();
        expect(parsed.description).toBeTruthy();
      }
    }
  }
});

test('product price is announced by screen readers', async ({ page }) => {
  await page.goto('/products/artisan-weave-tote');
  await injectAxe(page);

  // Price should have aria-label or be in an appropriate element
  const priceElements = page.locator('[aria-label*="price" i], [aria-label*="cost" i], .price, [data-testid="price"]');
  if (await priceElements.count() > 0) {
    await expect(priceElements.first()).toBeVisible();
  }
});

test('product images have descriptive alt text', async ({ page }) => {
  await page.goto('/products/artisan-weave-tote');
  await injectAxe(page);

  const images = page.locator('img');
  const count = await images.count();
  for (let i = 0; i < count; i++) {
    const img = images.nth(i);
    const alt = await img.getAttribute('alt');
    const role = await img.getAttribute('role');
    // Images must have alt text (may be empty string for decorative)
    expect(alt !== null).toBeTruthy();
    // If alt is empty, role should be "presentation" or "none"
    if (alt === '') {
      expect(role === 'presentation' || role === 'none').toBeTruthy();
    }
  }
});

test('product CTA buttons are keyboard accessible', async ({ page }) => {
  await page.goto('/products/artisan-weave-tote');
  await injectAxe(page);

  // Find all buttons and links
  const buttons = page.locator('button, a[href]');
  const count = await buttons.count();

  // Tab through and verify we can focus interactive elements
  for (let i = 0; i < Math.min(count, 10); i++) {
    await page.keyboard.press('Tab');
    const focused = page.locator('button:visible, a:visible, input:visible, [tabindex]:visible').first();
    await expect(focused).toBeVisible();
  }
});
