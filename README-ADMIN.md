# ALAYA INSIDER — ADMIN PLATFORM (Phase 5)

**Completely separate from the public website.**

## Access
- All routes live under `/admin/*`
- Layout is completely isolated (`app/(admin)/`)
- Public site remains untouched

## How to Run
The admin is served from the same Next.js app:

```bash
npm run dev
# Then visit http://localhost:3000/admin
```

## Key Features Implemented

- **Premium dark workspace** (Stripe/Linear/Vercel/Notion/Superhuman level)
- **Collapsible sidebar** with grouped navigation
- **Global Command Palette** (⌘K) — searches across every section + quick actions
- **Command Center** — rich KPI widgets, live activity feed, system health
- **Product Studio** — Table + Grid views, search, bulk action hints, status/affiliate health
- **AI Workspace** — 8 powerful AI tools with demo execution + quick prompt area
- **SEO Command** — Health overview + opportunity list + AI fix buttons
- **Search Intelligence** — Query analytics + no-result surfacing
- **Story Builder** — Editorial draft experience with publishing workflow
- **Brand Vault**, **Security Center**, **Activity Timeline**
- **Optimistic interactions**, keyboard hints, beautiful micro-details

## Design System
- Hairline borders
- Large, considered spacing
- Inter typography
- Soft shadows + subtle elevation
- Fast, confident interactions
- Consistent command-palette-driven navigation

## Next (Future Phases)
- Real Prisma + Postgres wiring (schema already exists from Phase 4)
- Real Typesense + Redis integration
- Full form editing, CSV import/export, version diffing
- Collaboration (comments, approvals)
- Advanced charts (Recharts already installed)
- Full RBAC enforcement
- Background job visualization

This admin platform was built with the same obsessive craftsmanship as the public site.

No templates. No generic dashboards. Pure intention.
