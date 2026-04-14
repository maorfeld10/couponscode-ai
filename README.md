# couponscode-ai

Monorepo for couponscode.ai — SEO-first coupon and deals aggregator.

## Structure

- `apps/web` — Next.js 15 public site (SSR/ISR)
- `apps/ingestion` — Node + Inngest affiliate network ingestion service
- `apps/admin-legacy` — Existing Vite/React admin panel (to be migrated in Subsystem 3)
- `packages/contracts` — Shared types, Drizzle schema, Zod validation, Inngest events
- `packages/db` — Drizzle client and migration runner
- `packages/llm` — Multi-provider LLM registry (Claude, OpenAI, Gemini, Grok, Manus, custom)
- `packages/ui` — Shared UI components

## Getting started

Prerequisites: Node 20+, pnpm 10+.

```bash
pnpm install
pnpm typecheck
```

## Documentation

- [PRD v3](docs/PRD-v3-couponscode-ai.md) — product requirements
- [Subsystem 1+2 Design Spec](docs/superpowers/specs/2026-04-13-couponscode-ai-rebuild-s1-s2-design.md)
- [Day 1 Implementation Plan](docs/superpowers/plans/2026-04-13-day1-monorepo-foundation.md)

## Status

Day 1 — Monorepo foundation complete. Next: Day 2 frontend + SEO core.
