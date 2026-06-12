# Performance & Reliability Budgets

**Frozen Frontend (Lighthouse CI)**
- Performance: 95+
- Accessibility: 100 (WCAG AAA)
- Best Practices: 100
- SEO: 100
- Core Web Vitals: All green

**APIs & Services**
- p95 < 400ms for product/search pages
- Search p95 < 80ms
- AI task p95 < 3s (with queuing)
- Recommendation generation < 200ms (cached)

**Load**
- Handles 10k concurrent users with <1% error rate
- Affiliate click burst (Black Friday scale) handled without degradation

Budgets are enforced in CI. Exceeding them blocks the pipeline.
