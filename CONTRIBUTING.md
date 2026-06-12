# Contributing to ALAYA INSIDER

Thank you for your interest in contributing to ALAYA INSIDER — a premium editorial affiliate discovery platform.

## Project Overview

ALAYA INSIDER is a Next.js 16 application with TypeScript, Tailwind 4, and Playwright for testing. The platform features 8 universes of curated editorial content, 200+ products, 50 brands, and 100+ journal articles with full IP-based currency detection and multi-language support (8 locales).

## Getting Started

```bash
# Install dependencies
npm install

# Generate Prisma client (optional — needed for DB features)
npx prisma generate

# Start development server
npm run dev

# Visit
open http://localhost:3000
```

## Development Workflow

### Branch Strategy

- `main` — Production-ready, deployable at all times
- `develop` — Integration branch for features
- `feature/*` — Individual feature branches (e.g., `feature/currency-widget`)
- `fix/*` — Bug fix branches
- `chore/*` — Maintenance, dependencies, tooling

### Commit Convention

We use conventional commits:
- `feat:` — New feature
- `fix:` — Bug fix
- `chore:` — Maintenance, deps, tooling
- `docs:` — Documentation
- `refactor:` — Code restructuring
- `test:` — Testing
- `style:` — Formatting, styling

### Local Development

The dev server runs on `http://localhost:3000`. Hot reload is enabled via Next.js Turbopack.

```bash
npm run dev
```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (marketing)/        # Public-facing routes
│   ├── (admin)/            # Admin dashboard routes
│   └── api/                # API route handlers
├── components/             # Shared React components
│   ├── ui/                 # Base UI primitives
│   ├── product/            # Product-related components
│   └── layout/             # Layout components (Header, Footer, etc.)
├── lib/                    # Utilities and business logic
│   ├── currency/           # Currency detection and exchange rates
│   ├── data/               # Seed data and data utilities
│   ├── config/             # App configuration
│   └── utils/              # General utility functions
├── messages/               # i18n locale files (8 languages)
├── tests/                  # Test suites
│   ├── api/                # API integration tests (Vitest)
│   ├── e2e/                # End-to-end tests (Playwright)
│   ├── accessibility/      # Accessibility tests
│   └── security/           # Security tests
├── prisma/                 # Prisma schema and migrations
├── scripts/                # Automation and deployment scripts
├── workers/                # Background job workers
└── infra/                  # Infrastructure configs (Docker, Terraform)
```

## Testing

We maintain a comprehensive test suite across multiple layers.

### Unit & Integration Tests (Vitest)

```bash
# Run all unit tests
npm run test:unit

# Watch mode
npm run test:unit:watch

# API tests only
npm run test:api
```

### End-to-End Tests (Playwright)

Tests cover 3 browsers (Chromium, Firefox, WebKit):

```bash
# Run all E2E tests (all browsers)
npm run test:e2e

# Run specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run a specific test file
npx playwright test tests/e2e/homepage.spec.ts
```

### Accessibility Tests

```bash
npm run test:a11y
```

### CI Pipeline

The CI pipeline (`.github/workflows/ci.yml`) runs on every push to `main`/`develop` and on PRs:

1. **TypeScript Check** — `npx tsc --noEmit`
2. **Unit Tests** — `npx vitest run`
3. **E2E Tests** — Playwright Chromium
4. **Production Build** — `npx next build`

All jobs run in parallel. E2E artifacts are uploaded on failure for debugging.

## Key Features

### Currency Detection

The app uses IP-based currency detection via the middleware:
1. **Server-side**: `middleware.ts` sets cookies (`x-currency-code`, `x-currency-symbol`, `x-currency-locale`) based on `cf-ipcountry` or `accept-language` headers
2. **Client-side**: `CurrencyProvider` in `app/layout.tsx` reads these cookies and fetches live exchange rates from `open.er-api.com`
3. **Fallback**: Hardcoded rates in `lib/currency/detect.ts` are used when the API is unavailable

The currency module is structured as:
- `lib/currency/detect.ts` — Country → currency mapping, server-side detection, `convertPrice` (synchronous fallback)
- `lib/currency/rates.ts` — Live exchange rate API integration with 1-hour cache
- `lib/currency/useCurrency.tsx` — React context provider and `useCurrency()` hook

### Multi-Language Support

8 locales are supported: English, French, German, Spanish, Japanese, Korean, Chinese, Portuguese. Locale files are in `messages/` as JSON. The middleware detects locale from `accept-language` or `cf-ipcountry` headers.

## Architecture Decisions

- **No `app/[locale]/` routing** — The app uses Next.js route groups (`app/(marketing)/`) instead of dynamic locale segments, as the project is primarily English-first with incremental i18n
- **Client-side currency conversion** — Live rates are fetched on mount and cached for 1 hour to keep `displayPrice` synchronous and avoid layout shifts
- **CSS-first design system** — Custom design system built on Tailwind 4 without CSS-in-JS or component libraries

## Before Submitting a PR

1. Run `npm run test:unit` — all tests should pass
2. Run `npx tsc --noEmit` — no TypeScript errors
3. Run `npm run build` — production build succeeds
4. Review the Playwright E2E tests for your feature area
5. Update relevant locale files in `messages/` if adding user-facing strings

## Questions?

Open an issue or refer to the project READMEs:
- [README.md](./README.md) — General overview
- [README-ADMIN.md](./README-ADMIN.md) — Admin platform
- [README-BACKEND.md](./README-BACKEND.md) — Backend & APIs
- [README-TESTING.md](./README-TESTING.md) — Testing strategy
