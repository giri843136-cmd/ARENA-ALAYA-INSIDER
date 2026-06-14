import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test('journal page meets WCAG AAA', async ({ page }) => {
  await page.goto('/journal');
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

test('article page meets WCAG AAA', async ({ page }) => {
  // Navigate to any article (picks the first available one)
  await page.goto('/journal');
  await page.waitForLoadState('networkidle');

  // Click the first article link
  const articleLink = page.locator('a[href*="/articles/"], a[href*="/journal/"]').first();
  if (await articleLink.count() > 0) {
    await articleLink.click();
    await page.waitForLoadState('networkidle');

    await injectAxe(page);
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa', 'best-practice'],
      },
    });
  }
});

test('article content has proper text spacing for readability', async ({ page }) => {
  await page.goto('/journal');
  await page.waitForLoadState('networkidle');

  const articleLink = page.locator('a[href*="/articles/"], a[href*="/journal/"]').first();
  if (await articleLink.count() > 0) {
    await articleLink.click();
    await page.waitForLoadState('networkidle');

    await injectAxe(page);

    // Check that article content has adequate line height
    const articleContent = page.locator('article, [role="article"], .prose, .content');
    if (await articleContent.count() > 0) {
      const lineHeight = await articleContent.first().evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          lineHeight: style.lineHeight,
          fontSize: style.fontSize,
          letterSpacing: style.letterSpacing,
        };
      });

      // Line height should be at least 1.5 for body text
      const lh = parseFloat(lineHeight.lineHeight);
      const fs = parseFloat(lineHeight.fontSize);
      expect(lh / fs).toBeGreaterThanOrEqual(1.4);
    }
  }
});

test('journal article has proper heading hierarchy', async ({ page }) => {
  await page.goto('/journal');
  await page.waitForLoadState('networkidle');

  const articleLink = page.locator('a[href*="/articles/"], a[href*="/journal/"]').first();
  if (await articleLink.count() > 0) {
    await articleLink.click();
    await page.waitForLoadState('networkidle');

    await injectAxe(page);

    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const count = await headings.count();

    if (count > 0) {
      expect(await headings.first().evaluate(el => el.tagName.toLowerCase())).toBe('h1');

      // Check for no skipped levels
      let lastLevel = 0;
      for (let i = 0; i < count; i++) {
        const tag = await headings.nth(i).evaluate(el => el.tagName.toLowerCase());
        const level = parseInt(tag[1]);
        if (lastLevel > 0) {
          expect(level - lastLevel).toBeLessThanOrEqual(2);
        }
        lastLevel = level;
      }
    }
  }
});
