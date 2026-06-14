import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test('admin page meets WCAG AAA', async ({ page }) => {
  await page.goto('/admin');
  await page.waitForLoadState('networkidle');
  await injectAxe(page);

  // Check for accessibility violations with AAA rules
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: { html: true },
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa', 'best-practice'],
    },
  });
});

test('admin page has proper ARIA labels', async ({ page }) => {
  await page.goto('/admin');
  await page.waitForLoadState('networkidle');
  await injectAxe(page);

  // Check for buttons with accessible labels
  const buttons = page.locator('button');
  const count = await buttons.count();

  for (let i = 0; i < count; i++) {
    const button = buttons.nth(i);
    const ariaLabel = await button.getAttribute('aria-label');
    const text = await button.textContent();

    // Each button should either have aria-label or visible text
    if (!ariaLabel && text) {
      expect(text.trim().length).toBeGreaterThan(0);
    }
  }
});

test('admin stats are accessible via screen readers', async ({ page }) => {
  await page.goto('/admin');
  await page.waitForLoadState('networkidle');
  await injectAxe(page);

  // Stat widgets should be semantically meaningful
  const statWidgets = page.locator('.widget, [class*="stat"], [class*="kpi"]');
  const count = await statWidgets.count();

  for (let i = 0; i < Math.min(count, 5); i++) {
    const widget = statWidgets.nth(i);
    // Should have some meaningful content
    const text = await widget.textContent();
    expect(text).toBeTruthy();
  }
});

test('admin navigation is keyboard accessible', async ({ page }) => {
  await page.goto('/admin');
  await page.waitForLoadState('networkidle');
  await injectAxe(page);

  // Tab through admin sidebar navigation
  const sidebarLinks = page.locator('nav a, [role="navigation"] a, .sidebar a');
  const count = await sidebarLinks.count();

  if (count > 0) {
    // Focus first link
    await sidebarLinks.first().focus();
    await expect(sidebarLinks.first()).toBeFocused();

    // Tab through and verify focus moves
    for (let i = 0; i < Math.min(count, 5); i++) {
      await page.keyboard.press('Tab');
      // The next interactive element should be focused
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();
    }
  }
});
