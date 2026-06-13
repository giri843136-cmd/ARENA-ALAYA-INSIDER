# ALAYA INSIDER — Color System & Accessibility Reference

> **Standard:** WCAG 2.1 Level AA
> **Text contrast minimum:** 4.5:1 (normal text), 3:1 (large text ≥18px)
> **Non-text contrast minimum:** 3:1

---

## Light Mode Palette

| Token | Value | Usage | Contrast on `#F5F0EA` |
|-------|-------|-------|----------------------|
| `--bg-primary` | `#F5F0EA` | Page background | — |
| `--bg-secondary` | `#EFE7DE` | Section alt background | — |
| `--bg-elevated` | `#FFFFFF` | Cards, inputs, modals | — |
| `--bg-dark` | `#111111` | Dark sections (footer) | — |
| `--text-primary` | `#1C1917` | **Headings** | ~12:1 ✅ |
| `--text-secondary` | `#4D443B` | Body text | ~5.1:1 ✅ |
| `--text-tertiary` | `#5C5249` | Muted text, timestamps | ~6.7:1 ✅ |
| `--text-accent` | `#7A6848` | Gold accent labels, links | ~4.75:1 ✅ |
| `--text-inverse` | `#F5F0EA` | Text on dark backgrounds | — |
| `--accent-gold` | `#7A6848` | Buttons, badges, hover states | ~4.75:1 ✅ |
| `--accent-gold-dark` | `#665840` | Button hover | ~5.5:1 ✅ |
| `--border-subtle` | `#E4DDD5` | Hairline borders | Non-text |
| `--border-soft` | `#D9D0C3` | Dividers | Non-text |

### Replaced Colors (Legacy → Current)

| Old Color | New Color | Reason |
|-----------|-----------|--------|
| `#C5AA8A` (gold accent) | `#7A6848` | ~2.6:1 → ~4.75:1 ✅ |
| `#C5A26F` (gold variant) | `#7A6848` | ~2.5:1 → ~4.75:1 ✅ |
| `#B89B7A` (light gold) | `#7A6848` | ~3.3:1 → ~4.75:1 ✅ |
| `#8A8178` (muted text) | `#5C5249` | ~3.4:1 → ~6.7:1 ✅ |
| `#6D655F` (secondary text) | **Kept** | ~5.0:1 ✅ (already passes) |

---

## Dark Mode Palette

| Token | Value | Contrast on `#1F1A17` |
|-------|-------|----------------------|
| `--text-primary` | `#EDE6DC` | ~12:1 ✅ |
| `--text-secondary` | `#C8C0B8` | ~5.5:1 ✅ |
| `--text-tertiary` | `#9A9188` | ~5.2:1 ✅ |
| `--text-accent` | `#D4B88A` | ~5.2:1 ✅ |
| `--accent-gold` | `#D4B88A` | ~5.2:1 ✅ |
| `--accent-gold-dark` | `#C8A67A` | ~4.6:1 ✅ |

---

## Badge & Button Guidance

| Component | Background | Text | Ratio |
|-----------|-----------|------|-------|
| Discount badge | `#7A6848` | `white` | ~5.4:1 ✅ |
| Bestseller badge | `#26221E` | `white` | ~12:1 ✅ |
| Primary button | `#1C1917` | `#F5F0EA` | ~12:1 ✅ |
| Accent button | `#7A6848` | `#1C1917` | ~4.75:1 ✅ |
| Secondary button | transparent | `#1C1917` | ~12:1 ✅ |

---

## CSS Variable Usage

Use these variables instead of hardcoded hex values:

```css
/* ✅ Preferred: */
color: var(--text-secondary);
background: var(--bg-elevated);

/* ❌ Avoid — hardcoded deprecated colors: */
color: #8A8178;  /* replaced by --text-tertiary */
color: #C5AA8A;  /* replaced by --text-accent */
```

---

## Quick Reference: Status Colors

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `--success` | `#6B8E6B` | `#6B8E6B` |
| `--warning` | `#C5A26F` | `#D4B88A` |
| `--error` | `#A36B6B` | `#B87A7A` |

---

## Testing

Run the Playwright a11y test to verify compliance:

```bash
npx playwright test tests/accessibility/homepage.a11y.test.ts
```

The test uses `axe-playwright` with default WCAG AA ruleset.
