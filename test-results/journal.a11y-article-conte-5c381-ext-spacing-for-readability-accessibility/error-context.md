# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ..\accessibility\journal.a11y.test.ts >> article content has proper text spacing for readability
- Location: tests\accessibility\journal.a11y.test.ts:40:5

# Error details

```
TimeoutError: locator.click: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('a[href*="/articles/"], a[href*="/journal/"]').first()
    - locator resolved to <a class="group block" href="/journal/the-quiet-luxury-of-linen">…</a>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
      - waiting 100ms
    18 × waiting for element to be visible, enabled and stable
       - element is not visible
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - img [ref=e3]
    - generic [ref=e10]: You're offline — some features may be unavailable.
    - button "Retry" [ref=e11]:
      - img [ref=e12]
      - text: Retry
  - region "Trust indicators" [ref=e17]:
    - generic [ref=e19]:
      - generic [ref=e20]:
        - img [ref=e21]
        - generic [ref=e26]:
          - generic [ref=e27]: 50K+
          - generic [ref=e28]: Monthly Readers
      - generic [ref=e29]:
        - img [ref=e30]
        - generic [ref=e33]:
          - generic [ref=e34]: 200+
          - generic [ref=e35]: Products Tested
      - generic [ref=e36]:
        - img [ref=e37]
        - generic [ref=e39]:
          - generic [ref=e40]: "4.8"
          - generic [ref=e41]: Avg. Rating
      - generic [ref=e42]:
        - img [ref=e43]
        - generic [ref=e46]:
          - generic [ref=e47]: 100+
          - generic [ref=e48]: Editorial Essays
      - generic [ref=e49]:
        - img [ref=e50]
        - generic [ref=e53]:
          - generic [ref=e54]: 100%
          - generic [ref=e55]: Independent
  - paragraph [ref=e59]: Curating the finest details...
  - region "Notifications alt+T"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { injectAxe, checkA11y } from 'axe-playwright';
  3   | 
  4   | test('journal page meets WCAG AAA', async ({ page }) => {
  5   |   await page.goto('/journal');
  6   |   await injectAxe(page);
  7   |   await checkA11y(page, null, {
  8   |     detailedReport: true,
  9   |     detailedReportOptions: { html: true },
  10  |     runOnly: {
  11  |       type: 'tag',
  12  |       values: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa', 'best-practice'],
  13  |     },
  14  |   });
  15  | });
  16  | 
  17  | test('article page meets WCAG AAA', async ({ page }) => {
  18  |   // Navigate to any article (picks the first available one)
  19  |   await page.goto('/journal');
  20  |   await page.waitForLoadState('networkidle');
  21  | 
  22  |   // Click the first article link
  23  |   const articleLink = page.locator('a[href*="/articles/"], a[href*="/journal/"]').first();
  24  |   if (await articleLink.count() > 0) {
  25  |     await articleLink.click();
  26  |     await page.waitForLoadState('networkidle');
  27  | 
  28  |     await injectAxe(page);
  29  |     await checkA11y(page, null, {
  30  |       detailedReport: true,
  31  |       detailedReportOptions: { html: true },
  32  |       runOnly: {
  33  |         type: 'tag',
  34  |         values: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa', 'best-practice'],
  35  |       },
  36  |     });
  37  |   }
  38  | });
  39  | 
  40  | test('article content has proper text spacing for readability', async ({ page }) => {
  41  |   await page.goto('/journal');
  42  |   await page.waitForLoadState('networkidle');
  43  | 
  44  |   const articleLink = page.locator('a[href*="/articles/"], a[href*="/journal/"]').first();
  45  |   if (await articleLink.count() > 0) {
> 46  |     await articleLink.click();
      |                       ^ TimeoutError: locator.click: Timeout 10000ms exceeded.
  47  |     await page.waitForLoadState('networkidle');
  48  | 
  49  |     await injectAxe(page);
  50  | 
  51  |     // Check that article content has adequate line height
  52  |     const articleContent = page.locator('article, [role="article"], .prose, .content');
  53  |     if (await articleContent.count() > 0) {
  54  |       const lineHeight = await articleContent.first().evaluate(el => {
  55  |         const style = window.getComputedStyle(el);
  56  |         return {
  57  |           lineHeight: style.lineHeight,
  58  |           fontSize: style.fontSize,
  59  |           letterSpacing: style.letterSpacing,
  60  |         };
  61  |       });
  62  | 
  63  |       // Line height should be at least 1.5 for body text
  64  |       const lh = parseFloat(lineHeight.lineHeight);
  65  |       const fs = parseFloat(lineHeight.fontSize);
  66  |       expect(lh / fs).toBeGreaterThanOrEqual(1.4);
  67  |     }
  68  |   }
  69  | });
  70  | 
  71  | test('journal article has proper heading hierarchy', async ({ page }) => {
  72  |   await page.goto('/journal');
  73  |   await page.waitForLoadState('networkidle');
  74  | 
  75  |   const articleLink = page.locator('a[href*="/articles/"], a[href*="/journal/"]').first();
  76  |   if (await articleLink.count() > 0) {
  77  |     await articleLink.click();
  78  |     await page.waitForLoadState('networkidle');
  79  | 
  80  |     await injectAxe(page);
  81  | 
  82  |     const headings = page.locator('h1, h2, h3, h4, h5, h6');
  83  |     const count = await headings.count();
  84  | 
  85  |     if (count > 0) {
  86  |       expect(await headings.first().evaluate(el => el.tagName.toLowerCase())).toBe('h1');
  87  | 
  88  |       // Check for no skipped levels
  89  |       let lastLevel = 0;
  90  |       for (let i = 0; i < count; i++) {
  91  |         const tag = await headings.nth(i).evaluate(el => el.tagName.toLowerCase());
  92  |         const level = parseInt(tag[1]);
  93  |         if (lastLevel > 0) {
  94  |           expect(level - lastLevel).toBeLessThanOrEqual(2);
  95  |         }
  96  |         lastLevel = level;
  97  |       }
  98  |     }
  99  |   }
  100 | });
  101 | 
```