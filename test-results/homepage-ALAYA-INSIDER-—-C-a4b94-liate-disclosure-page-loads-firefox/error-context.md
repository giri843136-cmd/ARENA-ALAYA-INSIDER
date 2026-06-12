# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.ts >> ALAYA INSIDER — Core User Flows >> affiliate disclosure page loads
- Location: tests\e2e\homepage.spec.ts:64:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1')
Expected: visible
Error: strict mode violation: locator('h1') resolved to 2 elements:
    1) <h1 class="font-display text-[52px] tracking-[-2.4px] leading-none">Affiliate Disclosure</h1> aka getByRole('heading', { name: 'Affiliate Disclosure' })
    2) <h1 class="font-display text-[52px] tracking-[-2.4px] leading-none">Affiliate Disclosure</h1> aka locator('div').filter({ hasText: 'Skip to main contentHAND-' }).locator('h1')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('h1')
    - locator resolved to <h1 class="font-display text-[52px] tracking-[-2.4px] leading-none">Affiliate Disclosure</h1>
    - unexpected value "hidden"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic "Trust indicators" [ref=e2]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - img [ref=e6]
        - generic [ref=e11]:
          - generic [ref=e12]: 50K+
          - generic [ref=e13]: Monthly Readers
      - generic [ref=e14]:
        - img [ref=e15]
        - generic [ref=e18]:
          - generic [ref=e19]: 200+
          - generic [ref=e20]: Products Tested
      - generic [ref=e21]:
        - img [ref=e22]
        - generic [ref=e24]:
          - generic [ref=e25]: "4.8"
          - generic [ref=e26]: Avg. Rating
      - generic [ref=e27]:
        - img [ref=e28]
        - generic [ref=e33]:
          - generic [ref=e34]: 100+
          - generic [ref=e35]: Editorial Essays
      - generic [ref=e36]:
        - img [ref=e37]
        - generic [ref=e40]:
          - generic [ref=e41]: 100%
          - generic [ref=e42]: Independent
  - link "Skip to main content" [ref=e43] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e44]:
    - generic [ref=e45]: HAND-PICKED WITH INTENTION • EDITORIALLY VERIFIED • SUSTAINABLY SOURCED
    - navigation [ref=e46]:
      - generic [ref=e47]:
        - link "A ALAYA INSIDER" [ref=e48] [cursor=pointer]:
          - /url: /
          - generic [ref=e50]: A
          - generic [ref=e51]:
            - generic [ref=e52]: ALAYA
            - generic [ref=e53]: INSIDER
        - generic [ref=e54]:
          - button "UNIVERSes ▾" [ref=e56]:
            - text: UNIVERSes
            - generic [ref=e57]: ▾
          - link "DISCOVER" [ref=e58] [cursor=pointer]:
            - /url: /search
          - link "COLLECTIONS" [ref=e59] [cursor=pointer]:
            - /url: /collections
          - link "JOURNAL" [ref=e60] [cursor=pointer]:
            - /url: /journal
          - link "BRANDS" [ref=e61] [cursor=pointer]:
            - /url: /brands
        - generic [ref=e62]:
          - 'button "Currency: USD. Click to change." [ref=e64]':
            - generic [ref=e65]: $
            - generic [ref=e66]: USD
            - img [ref=e67]
          - button "Open command palette (⌘K)" [ref=e69]:
            - img [ref=e70]
            - generic [ref=e73]: Search
            - generic [ref=e74]: ⌘K
          - link "Account" [ref=e75] [cursor=pointer]:
            - /url: /account
            - img [ref=e76]
          - link "12" [ref=e79] [cursor=pointer]:
            - /url: /saved
            - img [ref=e80]
            - generic [ref=e82]: "12"
          - link "Cart" [ref=e83] [cursor=pointer]:
            - /url: /cart
            - img [ref=e84]
  - main [ref=e88]:
    - generic [ref=e90]:
      - generic [ref=e91]:
        - generic [ref=e92]: TRANSPARENCY
        - heading "Affiliate Disclosure" [level=1] [ref=e93]
      - generic [ref=e94]:
        - paragraph [ref=e95]: ALAYA INSIDER is an editorial platform. When you purchase through links on our site, we may earn an affiliate commission at no additional cost to you.
        - paragraph [ref=e96]: We only recommend products we have personally tested and would buy for ourselves. Affiliate relationships never influence our editorial decisions.
        - paragraph [ref=e97]: Every affiliate link on the site is clearly marked. If you have questions about any recommendation or relationship, please reach out — we’re happy to explain.
        - paragraph [ref=e98]: Thank you for supporting the makers we love and the work we do.
      - generic [ref=e99]: "Last updated: June 2026"
  - contentinfo [ref=e100]:
    - generic [ref=e101]:
      - generic [ref=e102]:
        - generic [ref=e103]:
          - generic [ref=e104]:
            - generic [ref=e106]: A
            - generic [ref=e107]:
              - generic [ref=e108]: ALAYA
              - generic [ref=e109]: INSIDER
          - paragraph [ref=e110]:
            - text: An editorial sanctuary for the discerning. Curated with intention since 2023.
            - text: New York • London • Sydney.
          - generic [ref=e111]:
            - link "INSTAGRAM" [ref=e112] [cursor=pointer]:
              - /url: https://instagram.com
            - link "PINTEREST" [ref=e113] [cursor=pointer]:
              - /url: https://pinterest.com
            - link "SUBSTACK" [ref=e114] [cursor=pointer]:
              - /url: https://substack.com
        - generic [ref=e115]:
          - generic [ref=e116]: EXPLORE
          - generic [ref=e117]:
            - link "Universes" [ref=e118] [cursor=pointer]:
              - /url: /universes
            - link "Collections" [ref=e119] [cursor=pointer]:
              - /url: /collections
            - link "Discover" [ref=e120] [cursor=pointer]:
              - /url: /search
            - link "The Brand Vault" [ref=e121] [cursor=pointer]:
              - /url: /brands
            - link "The Journal" [ref=e122] [cursor=pointer]:
              - /url: /journal
        - generic [ref=e123]:
          - generic [ref=e124]: THE PLATFORM
          - generic [ref=e125]:
            - link "Our Story" [ref=e126] [cursor=pointer]:
              - /url: /about
            - link "Contact" [ref=e127] [cursor=pointer]:
              - /url: /contact
            - link "The Alaya Letter" [ref=e128] [cursor=pointer]:
              - /url: /newsletter
            - link "Saved & Wishlist" [ref=e129] [cursor=pointer]:
              - /url: /saved
            - link "Account" [ref=e130] [cursor=pointer]:
              - /url: /account
        - generic [ref=e131]:
          - generic [ref=e132]: SUPPORT & LEGAL
          - generic [ref=e133]:
            - link "Affiliate Disclosure" [ref=e134] [cursor=pointer]:
              - /url: /affiliate-disclosure
            - link "Privacy Policy" [ref=e135] [cursor=pointer]:
              - /url: /privacy
            - link "Terms of Service" [ref=e136] [cursor=pointer]:
              - /url: /terms
            - link "Help Center" [ref=e137] [cursor=pointer]:
              - /url: /contact
            - generic [ref=e138]: HAND-PICKED WITH INTENTION • EDITORIALLY VERIFIED
      - generic [ref=e140]:
        - generic [ref=e141]: A QUIET LETTER, ONCE A WEEK
        - generic [ref=e142]: The Alaya Letter
        - paragraph [ref=e143]: One beautiful object. One essay. Three things we’re quietly obsessed with. Delivered Sunday.
        - generic [ref=e144]:
          - textbox "your@email.com" [ref=e145]
          - button "SUBSCRIBE" [ref=e146] [cursor=pointer]
        - paragraph [ref=e147]: We respect your inbox. Unsubscribe instantly.
      - generic [ref=e148]:
        - generic [ref=e149]: © 2026 Alaya Insider. All rights reserved. Handcrafted with care in the quiet hours.
        - generic [ref=e150]:
          - link "Privacy" [ref=e151] [cursor=pointer]:
            - /url: /privacy
          - link "Terms" [ref=e152] [cursor=pointer]:
            - /url: /terms
          - link "Affiliates" [ref=e153] [cursor=pointer]:
            - /url: /affiliate-disclosure
  - button "Open AI Shopping Assistant" [ref=e154]:
    - img [ref=e155]
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e166] [cursor=pointer]:
    - img [ref=e167]
  - alert [ref=e171]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('ALAYA INSIDER — Core User Flows', () => {
  4  | 
  5  |   test('homepage loads hero section with branding', async ({ page }) => {
  6  |     await page.goto('/');
  7  |     await expect(page).toHaveTitle(/ALAYA INSIDER/);
  8  |     await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
  9  |   });
  10 | 
  11 |   test('homepage shows key editorial sections', async ({ page }) => {
  12 |     await page.goto('/');
  13 |     await expect(page.locator('h2:has-text("The Edit")').first()).toBeVisible({ timeout: 15000 });
  14 |     await expect(page.locator('h2:has-text("Explore the Universes")').first()).toBeVisible();
  15 |   });
  16 | 
  17 |   test('navigation links work', async ({ page }) => {
  18 |     await page.goto('/');
  19 |     await page.locator('nav a:has-text("Journal")').first().click();
  20 |     await expect(page).toHaveURL(/\/journal/);
  21 |   });
  22 | 
  23 |   test('universes page renders', async ({ page }) => {
  24 |     await page.goto('/universes');
  25 |     await expect(page.locator('h1')).toBeVisible();
  26 |     const universeLink = page.locator('a[href^="/universes/"]').first();
  27 |     await expect(universeLink).toBeVisible();
  28 |   });
  29 | 
  30 |   test('search page loads with search input', async ({ page }) => {
  31 |     await page.goto('/search');
  32 |     await expect(page.locator('input[type="text"]').first()).toBeVisible({ timeout: 15000 });
  33 |   });
  34 | 
  35 |   test('product detail page shows trust grid', async ({ page }) => {
  36 |     await page.goto('/products/linen-duvet-cover-oat');
  37 |     await expect(page.locator('[class*="text-\\[10px\\]"]:has-text("AVAILABILITY")').first()).toBeVisible({ timeout: 15000 });
  38 |     await expect(page.locator('[class*="text-\\[10px\\]"]:has-text("ORIGIN")').first()).toBeVisible();
  39 |     await expect(page.locator('[class*="text-\\[10px\\]"]:has-text("SHIPPING")').first()).toBeVisible();
  40 |     await expect(page.locator('[class*="text-\\[10px\\]"]:has-text("GUARANTEE")').first()).toBeVisible();
  41 |   });
  42 | 
  43 |   test('journal page shows article cards', async ({ page }) => {
  44 |     await page.goto('/journal');
  45 |     await expect(page.locator('h1')).toBeVisible();
  46 |   });
  47 | 
  48 |   test('brands page renders', async ({ page }) => {
  49 |     await page.goto('/brands');
  50 |     await expect(page.locator('h1')).toBeVisible();
  51 |   });
  52 | 
  53 |   test('collections page loads', async ({ page }) => {
  54 |     await page.goto('/collections');
  55 |     await expect(page.locator('h1')).toBeVisible();
  56 |   });
  57 | 
  58 |   test('footer has essential links', async ({ page }) => {
  59 |     await page.goto('/');
  60 |     await expect(page.locator('footer')).toBeVisible();
  61 |     await expect(page.locator('footer a:has-text("Privacy")').first()).toBeVisible();
  62 |   });
  63 | 
  64 |   test('affiliate disclosure page loads', async ({ page }) => {
  65 |     await page.goto('/affiliate-disclosure');
> 66 |     await expect(page.locator('h1')).toBeVisible();
     |                                      ^ Error: expect(locator).toBeVisible() failed
  67 |   });
  68 | 
  69 |   test('mobile viewport renders correctly', async ({ page }) => {
  70 |     await page.setViewportSize({ width: 375, height: 812 });
  71 |     await page.goto('/');
  72 |     await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
  73 |   });
  74 | 
  75 |   test('admin panel loads', async ({ page }) => {
  76 |     await page.goto('/admin');
  77 |     await expect(page).toHaveURL(/\/admin/);
  78 |   });
  79 | });
  80 | 
```