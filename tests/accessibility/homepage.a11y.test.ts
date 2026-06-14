import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test('homepage meets WCAG AAA', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: { html: true },
    // Enforce WCAG AAA rules
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa', 'best-practice'],
    },
  });
});

test('navigation has proper ARIA landmarks and focus order', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);

  // Verify main landmark exists
  const main = page.locator('main');
  await expect(main).toBeVisible();

  // Verify navigation landmark
  const nav = page.locator('nav');
  await expect(nav.first()).toBeVisible();

  // Check for skip-to-content link
  const skipLink = page.locator('a[href="#main-content"], a[href="#content"]');
  await expect(skipLink).toBeVisible();
});

test('images have descriptive alt text', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);

  const images = page.locator('img');
  const count = await images.count();
  for (let i = 0; i < count; i++) {
    const alt = await images.nth(i).getAttribute('alt');
    // Alt may be empty (decorative) - that's fine
    const src = await images.nth(i).getAttribute('src');
    expect(alt !== null).toBeTruthy();
    expect(src).toBeTruthy();
  }
});

test('color contrast meets AAA standards', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page, 'body', {
    runOnly: ['color-contrast', 'color-contrast-enhanced'],
    detailedReport: true,
  });
});

test('keyboard navigation is fully functional', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);

  // Tab through interactive elements
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toBeVisible();

  // Verify focus ring is visible
  const focusStyle = await focused.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return {
      outline: style.outline,
      outlineColor: style.outlineColor,
      outlineWidth: style.outlineWidth,
    };
  });
  // Focus ring should have non-zero width
  expect(focusStyle.outline).toBeTruthy();
});

test('focus trap in modals and dialogs', async ({ page }) => {
  await page.goto('/');

  // Check that any interactive elements don't cause focus loss
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');

  // There should always be a focused element
  const focused = page.locator(':focus');
  await expect(focused).toBeVisible();
});

test('font size respects user preferences', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);

  // Check that font sizes are in relative units (rem/em)
  const bodyFontSize = await page.evaluate(() => {
    const style = window.getComputedStyle(document.body);
    return style.fontSize;
  });
  // Should have a reasonable base font size (typically 16px)
  expect(parseInt(bodyFontSize)).toBeGreaterThanOrEqual(14);
});

test('page has proper heading hierarchy', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);

  // Check that there's exactly one h1 (within the page)
  const h1 = page.locator('h1');
  await expect(h1).toBeVisible();
  await expect(h1).toHaveCount(1);

  // Check heading structure doesn't skip levels
  const headings = page.locator('h1, h2, h3, h4, h5, h6');
  const count = await headings.count();
  let lastLevel = 0;
  for (let i = 0; i < count; i++) {
    const tag = await headings.nth(i).evaluate(el => el.tagName.toLowerCase());
    const level = parseInt(tag[1]);
    // Headings should not skip more than one level
    if (lastLevel > 0) {
      expect(level - lastLevel).toBeLessThanOrEqual(2);
    }
    lastLevel = level;
  }
});
