#!/bin/bash
set -e

echo "=== ALAYA INSIDER Full Quality Gate ==="

echo "1. Unit + Integration"
pnpm test:unit --coverage

echo "2. API + Contract"
pnpm test:api

echo "3. E2E (Playwright)"
pnpm test:e2e

echo "4. Performance budgets (Lighthouse CI)"
pnpm test:perf

echo "5. Load (k6 - short)"
k6 run tests/performance/k6/load-products.js --vus 20 --duration 30s

echo "6. Security scans"
pnpm audit --audit-level=moderate

echo "All quality gates passed."
