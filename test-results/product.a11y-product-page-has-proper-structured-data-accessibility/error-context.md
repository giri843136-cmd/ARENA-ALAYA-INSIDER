# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ..\accessibility\product.a11y.test.ts >> product page has proper structured data
- Location: tests\accessibility\product.a11y.test.ts:17:5

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 1
Received:    0
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
  1  | import { test, expect } from '@playwright/test';
  2  | import { injectAxe, checkA11y } from 'axe-playwright';
  3  | 
  4  | test('product page meets WCAG AAA', async ({ page }) => {
  5  |   await page.goto('/products/artisan-weave-tote');
  6  |   await injectAxe(page);
  7  |   await checkA11y(page, null, {
  8  |     detailedReport: true,
  9  |     detailedReportOptions: { html: true },
  10 |     runOnly: {
  11 |       type: 'tag',
  12 |       values: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa', 'best-practice'],
  13 |     },
  14 |   });
  15 | });
  16 | 
  17 | test('product page has proper structured data', async ({ page }) => {
  18 |   await page.goto('/products/artisan-weave-tote');
  19 |   await injectAxe(page);
  20 | 
  21 |   // Check for JSON-LD structured data
  22 |   const scripts = page.locator('script[type="application/ld+json"]');
  23 |   const count = await scripts.count();
> 24 |   expect(count).toBeGreaterThanOrEqual(1);
     |                 ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  25 | 
  26 |   // Check that structured data has required fields
  27 |   for (let i = 0; i < count; i++) {
  28 |     const content = await scripts.nth(i).textContent();
  29 |     if (content) {
  30 |       const parsed = JSON.parse(content);
  31 |       // Product schema should have name and description
  32 |       if (parsed['@type'] === 'Product') {
  33 |         expect(parsed.name).toBeTruthy();
  34 |         expect(parsed.description).toBeTruthy();
  35 |       }
  36 |     }
  37 |   }
  38 | });
  39 | 
  40 | test('product price is announced by screen readers', async ({ page }) => {
  41 |   await page.goto('/products/artisan-weave-tote');
  42 |   await injectAxe(page);
  43 | 
  44 |   // Price should have aria-label or be in an appropriate element
  45 |   const priceElements = page.locator('[aria-label*="price" i], [aria-label*="cost" i], .price, [data-testid="price"]');
  46 |   if (await priceElements.count() > 0) {
  47 |     await expect(priceElements.first()).toBeVisible();
  48 |   }
  49 | });
  50 | 
  51 | test('product images have descriptive alt text', async ({ page }) => {
  52 |   await page.goto('/products/artisan-weave-tote');
  53 |   await injectAxe(page);
  54 | 
  55 |   const images = page.locator('img');
  56 |   const count = await images.count();
  57 |   for (let i = 0; i < count; i++) {
  58 |     const img = images.nth(i);
  59 |     const alt = await img.getAttribute('alt');
  60 |     const role = await img.getAttribute('role');
  61 |     // Images must have alt text (may be empty string for decorative)
  62 |     expect(alt !== null).toBeTruthy();
  63 |     // If alt is empty, role should be "presentation" or "none"
  64 |     if (alt === '') {
  65 |       expect(role === 'presentation' || role === 'none').toBeTruthy();
  66 |     }
  67 |   }
  68 | });
  69 | 
  70 | test('product CTA buttons are keyboard accessible', async ({ page }) => {
  71 |   await page.goto('/products/artisan-weave-tote');
  72 |   await injectAxe(page);
  73 | 
  74 |   // Find all buttons and links
  75 |   const buttons = page.locator('button, a[href]');
  76 |   const count = await buttons.count();
  77 | 
  78 |   // Tab through and verify we can focus interactive elements
  79 |   for (let i = 0; i < Math.min(count, 10); i++) {
  80 |     await page.keyboard.press('Tab');
  81 |     const focused = page.locator(':focus');
  82 |     await expect(focused).toBeVisible();
  83 |   }
  84 | });
  85 | 
```