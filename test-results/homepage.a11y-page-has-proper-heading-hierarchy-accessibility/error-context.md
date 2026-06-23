# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ..\accessibility\homepage.a11y.test.ts >> page has proper heading hierarchy
- Location: tests\accessibility\homepage.a11y.test.ts:107:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('h1')
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('h1')
    14 × locator resolved to <h1 class="display mb-6 tracking-[-3.8px] leading-[0.9]">…</h1>
       - unexpected value "hidden"

```

```yaml
- img
- text: You're offline — some features may be unavailable.
- button "Retry":
  - img
  - text: Retry
- region "Trust indicators": 50K+ Monthly Readers 200+ Products Tested 4.8 Avg. Rating 100+ Editorial Essays 100% Independent
- paragraph: Curating the finest details...
- region "Notifications alt+T"
```

# Test source

```ts
  13  |       values: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa', 'best-practice'],
  14  |     },
  15  |   });
  16  | });
  17  | 
  18  | test('navigation has proper ARIA landmarks and focus order', async ({ page }) => {
  19  |   await page.goto('/');
  20  |   await injectAxe(page);
  21  | 
  22  |   // Verify main landmark exists
  23  |   const main = page.locator('main');
  24  |   await expect(main).toBeVisible();
  25  | 
  26  |   // Verify navigation landmark
  27  |   const nav = page.locator('nav');
  28  |   await expect(nav.first()).toBeVisible();
  29  | 
  30  |   // Check for skip-to-content link
  31  |   const skipLink = page.locator('a[href="#main-content"], a[href="#content"]');
  32  |   await expect(skipLink).toBeVisible();
  33  | });
  34  | 
  35  | test('images have descriptive alt text', async ({ page }) => {
  36  |   await page.goto('/');
  37  |   await injectAxe(page);
  38  | 
  39  |   const images = page.locator('img');
  40  |   const count = await images.count();
  41  |   for (let i = 0; i < count; i++) {
  42  |     const alt = await images.nth(i).getAttribute('alt');
  43  |     // Alt may be empty (decorative) - that's fine
  44  |     const src = await images.nth(i).getAttribute('src');
  45  |     expect(alt !== null).toBeTruthy();
  46  |     expect(src).toBeTruthy();
  47  |   }
  48  | });
  49  | 
  50  | test('color contrast meets AAA standards', async ({ page }) => {
  51  |   await page.goto('/');
  52  |   await injectAxe(page);
  53  |   await checkA11y(page, 'body', {
  54  |     runOnly: ['color-contrast', 'color-contrast-enhanced'],
  55  |     detailedReport: true,
  56  |   });
  57  | });
  58  | 
  59  | test('keyboard navigation is fully functional', async ({ page }) => {
  60  |   await page.goto('/');
  61  |   await injectAxe(page);
  62  | 
  63  |   // Tab through interactive elements
  64  |   await page.keyboard.press('Tab');
  65  |   const focused = page.locator(':focus');
  66  |   await expect(focused).toBeVisible();
  67  | 
  68  |   // Verify focus ring is visible
  69  |   const focusStyle = await focused.evaluate((el) => {
  70  |     const style = window.getComputedStyle(el);
  71  |     return {
  72  |       outline: style.outline,
  73  |       outlineColor: style.outlineColor,
  74  |       outlineWidth: style.outlineWidth,
  75  |     };
  76  |   });
  77  |   // Focus ring should have non-zero width
  78  |   expect(focusStyle.outline).toBeTruthy();
  79  | });
  80  | 
  81  | test('focus trap in modals and dialogs', async ({ page }) => {
  82  |   await page.goto('/');
  83  | 
  84  |   // Check that any interactive elements don't cause focus loss
  85  |   await page.keyboard.press('Tab');
  86  |   await page.keyboard.press('Tab');
  87  |   await page.keyboard.press('Tab');
  88  | 
  89  |   // There should always be a focused element
  90  |   const focused = page.locator(':focus');
  91  |   await expect(focused).toBeVisible();
  92  | });
  93  | 
  94  | test('font size respects user preferences', async ({ page }) => {
  95  |   await page.goto('/');
  96  |   await injectAxe(page);
  97  | 
  98  |   // Check that font sizes are in relative units (rem/em)
  99  |   const bodyFontSize = await page.evaluate(() => {
  100 |     const style = window.getComputedStyle(document.body);
  101 |     return style.fontSize;
  102 |   });
  103 |   // Should have a reasonable base font size (typically 16px)
  104 |   expect(parseInt(bodyFontSize)).toBeGreaterThanOrEqual(14);
  105 | });
  106 | 
  107 | test('page has proper heading hierarchy', async ({ page }) => {
  108 |   await page.goto('/');
  109 |   await injectAxe(page);
  110 | 
  111 |   // Check that there's exactly one h1 (within the page)
  112 |   const h1 = page.locator('h1');
> 113 |   await expect(h1).toBeVisible();
      |                    ^ Error: expect(locator).toBeVisible() failed
  114 |   await expect(h1).toHaveCount(1);
  115 | 
  116 |   // Check heading structure doesn't skip levels
  117 |   const headings = page.locator('h1, h2, h3, h4, h5, h6');
  118 |   const count = await headings.count();
  119 |   let lastLevel = 0;
  120 |   for (let i = 0; i < count; i++) {
  121 |     const tag = await headings.nth(i).evaluate(el => el.tagName.toLowerCase());
  122 |     const level = parseInt(tag[1]);
  123 |     // Headings should not skip more than one level
  124 |     if (lastLevel > 0) {
  125 |       expect(level - lastLevel).toBeLessThanOrEqual(2);
  126 |     }
  127 |     lastLevel = level;
  128 |   }
  129 | });
  130 | 
```