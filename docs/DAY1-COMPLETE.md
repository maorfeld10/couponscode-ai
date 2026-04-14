# Day 1 Milestone — Monorepo Foundation Complete

**Date:** 2026-04-13

## What shipped

- Monorepo `couponscode-ai` initialized with pnpm workspaces
- Existing Vite admin relocated into `apps/admin-legacy/` (typecheck passing)
- 4 packages scaffolded: `@couponscode/contracts`, `@couponscode/db`, `@couponscode/llm`, `@couponscode/ui`
- 2 new apps scaffolded: `@couponscode/web` (Next.js 15), `@couponscode/ingestion` (Node + Inngest)
- 6 additive DB migrations written with matching rollbacks:
  - 0001: merchants/coupons column additions
  - 0002: networks, credentials, ingestion_runs, refresh_runs
  - 0003: llm_providers multi-provider registry
  - 0004: content pipeline tables (drafts, published, topic queue)
  - 0005: tracking tables (sessions, conversions)
  - 0006: Row Level Security policies on all sensitive tables
- GitHub Actions CI workflow (typecheck + build)
- Private GitHub repo at `maorfeld10/couponscode-ai` pushed
- PRD v3, Subsystem 1+2 design spec, Day 1 plan, and CLAUDE.md committed into monorepo

## What did NOT ship (deferred)

- Migration execution — no staging Supabase exists; migrations are written but unapplied
- Drizzle schema introspection — skipped until staging DB available
- Any real frontend content (placeholder homepage only)
- FMTC ingestion (Day 3)
- Next.js app full SEO rendering (Day 2)
- Admin migration to Next.js (Day 4)

## Verification results

- All 7 workspace packages typecheck with 0 errors
- `apps/web` builds successfully with Next.js 15
- `apps/admin-legacy` builds successfully with Vite
- 12 migration SQL files committed

## Next: Day 2 — Frontend + SEO Core

Goals for Day 2:
- Homepage, merchant page, category page rendering from Drizzle
- Full Schema.org JSON-LD
- Sitemap index with per-type sitemaps
- Click-out flow + /api/click endpoint
- Newsletter endpoint
- Deploy to Vercel preview

Before Day 2 can execute the ingestion parts, the user must resolve:
1. Staging Supabase project created OR permission granted to run additive migrations against production with prior backup
2. Drizzle introspection run to populate `packages/contracts/src/schema.ts`
