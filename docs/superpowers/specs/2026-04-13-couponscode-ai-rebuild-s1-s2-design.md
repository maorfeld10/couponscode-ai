# couponscode.ai — Rebuild Design Spec (Subsystems 1 + 2, Path C)

**Date:** 2026-04-13
**Status:** Draft — awaiting user review
**Scope:** First 3 weeks of the 5-subsystem rebuild defined in PRD v2
**Strategy:** Path C (Hybrid) — new Next.js frontend + ingestion pipeline, existing Vite admin kept running during transition, shared Supabase DB

---

## 1. Context & Constraints

### What we're building
A rebuild of the existing TopCoupons.ai / couponscode.ai coupon aggregator that:
- Preserves the existing Supabase database, merchants, coupons, and content (no destructive changes)
- Introduces a modern Next.js 14 frontend with real SSR/ISR for SEO
- Adds a proper multi-network ingestion pipeline (FMTC + 8 affiliate networks via a pluggable adapter pattern)
- Keeps the existing Vite-based admin running unchanged during the transition (to be migrated in Subsystem 3)
- Lays the foundation for a multi-provider LLM registry (to be activated in Subsystem 4)

### Scope of this spec
This spec covers **Subsystems 1 and 2 only** — the first 3 weeks of work. Subsystems 3, 4, 5 get their own specs.

- Subsystem 1 — Ingestion Pipeline (FMTC + first 3 network adapters)
- Subsystem 2 — Frontend + SEO Core (Next.js 14 App Router public site)
- Foundation pieces for Subsystems 3, 4, 5 (DB tables, package scaffolding, interfaces) — created now, fully used later

### Constraints
- **Supabase free tier** at MVP (~200 merchants, tight on DB size and connection limits)
- **FMTC subscription** available
- **Existing code preserved** — moved into `apps/admin-legacy/` unchanged
- **No Next.js rewrite of the admin** in this phase
- **Multi-provider LLM registry** required (Claude, ChatGPT, Gemini, Grok, Manus, + custom) with dynamic admin UI — extends the PRD's narrower "Claude + OpenAI fallback" design
- **n8n-mcp knowledge server** is installed for future n8n workflow design; Inngest remains the runtime for now

### Success criteria for the 3-week milestone
1. Public site at couponscode.ai running on Next.js 14 with 200+ server-rendered merchant pages indexed by Google
2. FMTC ingestion job running on a 6-hour cron, successfully upserting merchants and coupons
3. Daily date-refresh job updating `last_updated` and triggering ISR revalidation
4. Full Schema.org JSON-LD on every merchant/category/homepage page, validating against Google Rich Results Test
5. Sitemap index + per-type sitemaps auto-regenerating daily with accurate `lastmod`
6. Click-out flow working end-to-end with `click_events` logging
7. Existing Vite admin still working unchanged on the same Supabase DB
8. Core Web Vitals targets hit: LCP < 2.0s, CLS < 0.05, INP < 200ms on merchant pages

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│              couponscode.ai (Vercel, Next.js 14)        │
│                    [NEW - Subsystem 2]                  │
│  /                     ← homepage (ISR)                 │
│  /[slug]-coupons       ← merchant pages (ISR 24h)       │
│  /category/[slug]      ← category pages (ISR 24h)       │
│  /blog/[slug]          ← blog (Subsystem 4 stub)        │
│  /api/click            ← click-out logger               │
│  /api/newsletter       ← newsletter signup              │
│  /api/revalidate       ← ISR revalidation webhook       │
│  /sitemap.xml          ← auto-generated daily           │
└─────────────────────────────────────────────────────────┘
                           │  reads via Drizzle
                           ▼
┌─────────────────────────────────────────────────────────┐
│           Supabase Postgres (EXISTING, evolved)         │
│  Existing: merchants, coupons, categories, click_events │
│            site_users, legal_pages, audit_logs          │
│            admin_users, merchant_private_data           │
│  NEW:      networks, network_credentials                │
│            ingestion_runs, refresh_runs                 │
│            llm_providers                                │
│            content_drafts, content_published            │
│            topic_queue, sessions, conversions           │
└─────────────────────────────────────────────────────────┘
                           ▲  writes via Drizzle
                           │
┌─────────────────────────────────────────────────────────┐
│         Ingestion Service (Node + Inngest)              │
│                 [NEW - Subsystem 1]                     │
│   FMTC adapter (Tier 1, every 6h)                       │
│   Awin adapter (Tier 2, every 1–2h)                     │
│   CJ adapter (Tier 2)                                   │
│   Impact adapter (Tier 2)                               │
│   + NetworkAdapter interface for plug-in adapters       │
└─────────────────────────────────────────────────────────┘
                           ▲  writes/reads via supabase-js
                           │
┌─────────────────────────────────────────────────────────┐
│       EXISTING Vite admin (kept running, unchanged)     │
│   admin.couponscode.ai OR /admin-legacy                 │
│   ← supabaseService.ts still used; migrates to Next.js  │
│     in Subsystem 3                                      │
└─────────────────────────────────────────────────────────┘
```

**Key design decisions:**
- **One shared Supabase database** — the new Next.js app, the ingestion service, and the legacy Vite admin all read/write the same Postgres instance. No data duplication, no sync jobs.
- **Drizzle in the new stack only** — `apps/web` and `apps/ingestion` use Drizzle via `packages/contracts`. `apps/admin-legacy` continues to use its existing `supabaseService.ts`. This keeps the admin unbroken.
- **Additive DB migrations only** — every schema change is an `ADD COLUMN` or `CREATE TABLE`. No drops, no renames. Existing admin queries keep working.
- **Inngest as the job runner** — chosen for code-defined jobs, retries, and free-tier fit. Designed so jobs can be migrated to n8n webhook triggers later without architectural changes.

---

## 3. Repository Structure (monorepo)

```
couponscode-ai/                          ← private GitHub repo at maorfeld10/couponscode-ai
├── apps/
│   ├── web/                             ← NEW: Next.js 14 public site (Subsystem 2)
│   │   ├── app/
│   │   │   ├── layout.tsx               ← root layout, GA4, Consent Mode v2
│   │   │   ├── page.tsx                 ← homepage (ISR 6h)
│   │   │   ├── [slug]/page.tsx          ← merchant pages (ISR 24h)
│   │   │   ├── category/[slug]/page.tsx ← category pages (ISR 24h)
│   │   │   ├── blog/[slug]/page.tsx     ← blog (stub now, real in S4)
│   │   │   ├── search/page.tsx          ← search results (dynamic)
│   │   │   ├── legal/[slug]/page.tsx    ← privacy, terms, disclosure
│   │   │   ├── api/
│   │   │   │   ├── click/route.ts       ← POST: log click, return outbound URL
│   │   │   │   ├── newsletter/route.ts  ← POST: newsletter signup
│   │   │   │   └── revalidate/route.ts  ← POST: ISR revalidation webhook
│   │   │   ├── sitemap.ts               ← Next.js convention → /sitemap.xml
│   │   │   ├── robots.ts                ← Next.js convention → /robots.txt
│   │   │   └── not-found.tsx            ← 404
│   │   ├── components/                  ← MerchantHero, CouponCard, SearchBar, etc.
│   │   ├── lib/
│   │   │   ├── schema-jsonld.ts         ← JSON-LD generator per page type
│   │   │   ├── drizzle.ts               ← Drizzle client from packages/db
│   │   │   └── analytics.ts             ← GA4 + internal tracking
│   │   ├── public/                      ← static assets
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   ├── ingestion/                       ← NEW: Node + Inngest service (Subsystem 1)
│   │   ├── src/
│   │   │   ├── adapters/                ← NetworkAdapter implementations
│   │   │   ├── normalizer.ts
│   │   │   ├── dedupe.ts
│   │   │   ├── upsert.ts
│   │   │   ├── vault.ts
│   │   │   └── jobs/                    ← Inngest cron functions
│   │   ├── inngest.config.ts
│   │   └── package.json
│   └── admin-legacy/                    ← EXISTING Vite + Express + React admin, moved as-is
│       ├── src/                         ← all current src/ contents
│       ├── server.ts                    ← existing Express meta injection
│       ├── vite.config.ts
│       ├── scripts/generate-sitemap.ts  ← kept for legacy use; apps/web has its own
│       └── package.json
├── packages/
│   ├── contracts/                       ← Drizzle schema + TS types + Zod + events
│   │   ├── src/
│   │   │   ├── schema.ts                ← Drizzle table definitions
│   │   │   ├── types.ts                 ← shared TS interfaces (RawMerchant, etc.)
│   │   │   ├── zod.ts                   ← Zod validation schemas
│   │   │   └── events.ts                ← Inngest event names + payloads
│   │   └── package.json
│   ├── db/                              ← Drizzle instance + migrations
│   │   ├── src/
│   │   │   ├── client.ts                ← Drizzle + pg connection
│   │   │   └── migrations/              ← drizzle-kit generated
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   ├── llm/                             ← Multi-provider LLM registry (stubbed now)
│   │   ├── src/
│   │   │   ├── adapters/                ← anthropic, openai, google, xai, manus, custom
│   │   │   ├── router.ts                ← role + priority routing with fallback
│   │   │   ├── vault.ts                 ← API key resolution
│   │   │   └── types.ts
│   │   └── package.json
│   └── ui/                              ← shared components (minimal at start)
├── docs/
│   └── superpowers/
│       ├── specs/                       ← design docs live here
│       └── plans/                       ← implementation plans live here
├── .github/workflows/
│   └── ci.yml                           ← typecheck + lint + build
├── pnpm-workspace.yaml
├── package.json                         ← root workspace config
├── tsconfig.base.json                   ← extended by each app/package
├── .gitignore
├── CLAUDE.md                            ← moved from existing claude.md (capitalized)
└── README.md
```

**Tooling:**
- pnpm workspaces (no Turborepo at MVP; revisit if builds get slow)
- TypeScript strict mode across all packages
- ESLint + Prettier enforced in CI
- Drizzle ORM for all DB access except legacy admin
- Zod for all external-input validation (API routes, webhooks, env vars)

**Legacy admin path handling:**
The existing `src/`, `server.ts`, `vite.config.ts`, `scripts/`, `supabase/`, `public/`, `package.json`, `vercel.json`, `index.html`, `tsconfig.json`, and `.env.example` move as-is into `apps/admin-legacy/`. The root `package.json` is replaced with a pnpm workspace config. The admin is deployed separately from the new Next.js app (separate Vercel project) and continues pointing at the same Supabase DB.

---

## 4. Subsystem 2 — Frontend + SEO Core

### 4.1 Route Inventory

| Route | Rendering | Revalidation | Notes |
|---|---|---|---|
| `/` | SSR + ISR | 6h | Featured merchants + trending coupons |
| `/[slug]-coupons` | SSR + ISR | 24h | Merchant page, full JSON-LD, FAQ |
| `/category/[slug]` | SSR + ISR | 24h | Category listing with programmatic content |
| `/blog/[slug]` | SSR + ISR | 24h | Blog post (stub now, real in S4) |
| `/search?q=` | Dynamic SSR | — | Search results, no cache |
| `/legal/[slug]` | SSG | build time | Privacy, terms, affiliate disclosure |
| `/sitemap.xml` | Dynamic | daily | Next.js `sitemap.ts` convention |
| `/robots.txt` | Static | — | Next.js `robots.ts` convention |
| `/api/click` | Edge runtime | — | POST: log click, return outbound URL |
| `/api/newsletter` | Node runtime | — | POST: newsletter signup |
| `/api/revalidate` | Node runtime | — | POST: webhook triggered by refresh jobs |

### 4.2 SEO Requirements (non-negotiable)

1. **Full server-rendered HTML bodies.** Every page returns complete HTML with merchant data, coupon text, and JSON-LD on the first response. No client-side fetching for primary content. Verified via `curl` showing real content in response body.
2. **Schema.org JSON-LD per page type**, rendered server-side in the HTML head:
   - Homepage: `Organization`, `WebSite` (with `SearchAction`), `BreadcrumbList`
   - Merchant page: `Store`, `Offer` (one per coupon, with `validFrom`, `validThrough`, `priceCurrency`, `availability`), `FAQPage`, `BreadcrumbList`, optional `AggregateRating` (reserved, populated later)
   - Category page: `CollectionPage`, `ItemList`, `BreadcrumbList`
   - Blog post: `Article` (with `datePublished`, `dateModified`, `author`, `publisher`), `BreadcrumbList`
3. **Canonical URLs** on every page via Next.js `metadata` API.
4. **Open Graph + Twitter Card** metadata on every page.
5. **Hreflang stub structure** — empty `<link rel="alternate">` list now, wired to a DB column in v2.
6. **Sitemap index** at `/sitemap.xml` pointing to:
   - `/sitemap-merchants.xml`
   - `/sitemap-categories.xml`
   - `/sitemap-blog.xml`
   - `/sitemap-legal.xml`
   Each sub-sitemap regenerates daily with accurate `lastmod` timestamps from the DB.
7. **HTTP status codes** — 200 for active, 404 for missing, 410 for permanently-expired merchants, 301 for slug changes (handled via a `merchant_slug_redirects` table, added in a future migration).
8. **Structured data validation gate** — CI runs Google's Rich Results Test against a sample of 10 merchant pages; build fails if any return warnings.

### 4.3 Core Web Vitals Targets

| Metric | Target | How we hit it |
|---|---|---|
| LCP | < 2.0s | SSR + edge CDN + preload hero image |
| CLS | < 0.05 | All images have explicit width/height, font-display: optional, reserved space for async content |
| INP | < 200ms | No blocking JS on interaction, debounced search, React Server Components where possible |
| TTFB | < 400ms | Vercel edge + ISR cache |

### 4.4 Design Standards (from UI/UX Pro Max guide)

All non-negotiable:
- **Accessibility:** contrast ≥ 4.5:1, 2–4px focus rings on interactive elements, ARIA labels on icon-only buttons, keyboard nav matches visual order, `prefers-reduced-motion` respected
- **Touch & interaction:** 44×44 minimum touch targets, 8px spacing between targets, visual feedback within 100ms of tap, `touch-action: manipulation` to remove 300ms delay
- **Typography:** base 16px, line-height 1.5, font-display swap, preload primary weight only
- **Color:** Tailwind design tokens, no raw hex in components, semantic color roles (`text-primary`, `bg-surface`, etc.)
- **Animation:** 150–300ms duration, motion conveys meaning (not decoration)
- **Forms:** visible labels above fields, errors inline near the field, helper text for ambiguous inputs, no placeholder-only labeling

### 4.5 Click-Out Flow (preserved from v1)

1. User clicks "Show Code" or "Get Deal" on a coupon card
2. Client POSTs to `/api/click` with `{ merchantId, couponId, clickType, sessionId }`
3. Server writes `click_events` row, returns `{ outboundUrl, couponCode }`
4. Client opens a new tab to `/{merchant-slug}-coupons?openCoupon={couponId}` (keeps user on site, auto-opens coupon modal via URL param)
5. Current tab navigates to `outboundUrl` (affiliate tracking link)
6. **Popup-blocker fallback:** if `window.open` returns null, open the coupon modal in the current tab and show the code inline with a "Visit store" button
7. **URL validation:** the outbound URL is validated server-side before return — must parse as `URL`, must use `http`/`https`, must not be a localhost/file/javascript URI

### 4.6 Daily Date-Refresh Job (the SEO freshness loop)

Runs as Inngest cron at 03:00 UTC:
1. `UPDATE merchants SET last_updated = NOW() WHERE status = 'active' AND is_visible = true`
2. `UPDATE coupons SET last_seen_at = NOW() WHERE merchant_id IN (active merchants) AND (valid_through IS NULL OR valid_through > NOW())`
3. Fetch affected merchant slugs, POST each to `/api/revalidate` which calls `revalidatePath()` on the Next.js ISR cache
4. Rewrite all sub-sitemaps with fresh `lastmod`
5. Log run to `refresh_runs` table: `{ run_at, items_updated, duration_ms, status, error }`

The user-visible "Updated {Month Day, Year}" string is computed from `last_updated` at render time — no string rewrite needed. Every day, the date shown reflects today.

### 4.7 Search

- Header search input, 300ms debounce
- Server action queries Postgres `pg_trgm` fuzzy match on `merchants.name` and `coupons.title`, ranked by `priority_score DESC`
- Autocomplete dropdown shows top 8 results
- Enter key navigates to `/search?q={query}` full results page
- All searches logged to GA4 and an internal `search_events` table (created in a later subsystem, not this spec)
- Input validation: query length 1–100 chars, strip control characters

---

## 5. Subsystem 1 — Ingestion Pipeline

### 5.1 NetworkAdapter Interface

```ts
// packages/contracts/src/types.ts
export interface RawMerchant {
  externalId: string;
  name: string;
  domain: string;
  logoUrl?: string;
  categoryNames?: string[];
  trackingLinkTemplate: string;
  description?: string;
  rawPayload: unknown;
}

export interface RawCoupon {
  externalId: string;
  merchantExternalId: string;
  title: string;
  code?: string;
  dealType: 'code' | 'sale' | 'printable';
  discountValue?: number;
  discountType?: 'percent' | 'fixed';
  validFrom?: Date;
  validThrough?: Date;
  priority?: number;
  rawPayload: unknown;
}

export interface HealthStatus {
  ok: boolean;
  message: string;
  latencyMs: number;
}

// packages/ingestion/src/adapters/base.ts
export abstract class NetworkAdapter {
  abstract readonly key: string;
  abstract fetchMerchants(): Promise<RawMerchant[]>;
  abstract fetchCoupons(merchantExternalId?: string): Promise<RawCoupon[]>;
  abstract getTrackingLink(merchantId: string, deepLink?: string, subId?: string): string;
  abstract healthCheck(): Promise<HealthStatus>;
}
```

Each network implementation is a single file in `packages/ingestion/src/adapters/` that extends `NetworkAdapter`. Adding a new network requires:
1. Create `packages/ingestion/src/adapters/<network>.ts`
2. Add one line to `packages/ingestion/src/adapters/index.ts` registry
3. Create a row in the `networks` table with `adapter_key = '<network>'`
4. Store credentials in the vault with `network_credentials.key_vault_ref`

No other code changes anywhere.

### 5.2 Ingestion Pipeline (data flow)

```
Network API/Feed
      │
      ▼
  fetchMerchants() / fetchCoupons()   ← adapter-specific
      │
      ▼
  Raw records (RawMerchant, RawCoupon)
      │
      ▼
  Normalizer                          ← maps raw → internal schema
      │
      ▼
  Dedupe                              ← merchant: lowercased domain
      │                                 coupon: sha256(merchantId + code + dealType)
      ▼
  Manual override check               ← skip fields in manual_override_fields
      │
      ▼
  Upsert to merchants / coupons tables
      │
      ▼
  Emit ingestion.merchant.upserted    ← Inngest event (consumed by S4 later)
      │
      ▼
  Write ingestion_runs log row
```

### 5.3 Scheduled Jobs

| Job | Cron | Scope | Runtime |
|---|---|---|---|
| `fmtc-full-sync` | Every 6h | All FMTC merchants + coupons | Inngest |
| `network-priority-sync` | Every 1–2h | Top 100 merchants per priority network | Inngest |
| `coupon-expiration-sweep` | Daily 02:00 UTC | Mark expired coupons, archive | Inngest |
| `date-refresh` | Daily 03:00 UTC | Touch `last_updated`, revalidate ISR | Inngest |
| `failed-job-retry` | Every 30 min | Retry failed ingestion runs with exponential backoff | Inngest |

### 5.4 Credentials Vault

MVP uses Supabase Vault (or equivalent env-based encrypted store):
- `network_credentials.key_vault_ref` stores an opaque reference
- `packages/ingestion/src/vault.ts` resolves the reference to the actual secret at runtime
- Secrets are never logged, never returned from API endpoints, never sent to the client
- Admin UI (built in Subsystem 3) manages CRUD through server actions only

### 5.5 Subsystem 1 Scope for the 3-Week Window

- Week 1: `NetworkAdapter` base class + `fmtc.ts` adapter + normalizer + dedupe + upsert + Inngest cron
- Week 2: `awin.ts`, `cj.ts`, `impact.ts` (3 more adapters)
- Week 3: Manual override logic, credentials vault, ingestion console hooks (the UI lives in S3 but the API endpoints exist)

The remaining 5 adapters (Partnerize, Rakuten, ShareASale, FlexOffers, Pepperjam) defer to weeks 7–9 in the overall 10-week plan.

---

## 6. Shared DB Contracts (additive migrations)

### 6.1 Additions to Existing Tables

| Table | New column | Type | Default | Purpose |
|---|---|---|---|---|
| `merchants` | `domain` | text | null | Dedupe key (lowercased) |
| `merchants` | `primary_network_id` | uuid fk → `networks.id` | null | Which network owns this merchant |
| `merchants` | `manual_override_fields` | jsonb | `'{}'` | Fields locked from automated overwrites |
| `merchants` | `last_updated` | timestamptz | `now()` | SEO freshness signal |
| `merchants` | `priority_score` | int | 0 | Ranking for search + homepage |
| `coupons` | `source_network` | text | null | Which network provided this coupon |
| `coupons` | `external_id` | text | null | Network's ID for this coupon |
| `coupons` | `last_seen_at` | timestamptz | `now()` | Freshness signal |
| `coupons` | `manual_override` | bool | false | Locked from automated overwrites |
| `coupons` | `dedupe_hash` | text | null, unique | sha256(merchant_id + code + deal_type) |

All new columns are nullable or have defaults — existing rows populate automatically on first upsert.

### 6.2 New Tables

| Table | Purpose |
|---|---|
| `networks` | Affiliate network registry. Columns: `id, name, adapter_key unique, is_active, last_sync_at, status, created_at` |
| `network_credentials` | Encrypted credential refs. Columns: `network_id fk pk, key_vault_ref, created_at, updated_at` |
| `ingestion_runs` | Job execution log. Columns: `id, network_id fk, job_type, started_at, finished_at, records_processed, status, error` |
| `refresh_runs` | Date-refresh job log. Columns: `id, run_at, items_updated, duration_ms, status, error` |
| `llm_providers` | Multi-provider LLM registry (see Section 7) |
| `content_drafts` | LLM-generated drafts pending editor review (Subsystem 4 — table exists now, used later) |
| `content_published` | Approved, published content (Subsystem 4) |
| `topic_queue` | Content backlog (Subsystem 4) |
| `sessions` | UTM + session persistence (Subsystem 5) |
| `conversions` | S2S postback records (Subsystem 5) |

Full column definitions in PRD v2 Appendix A — reproduced verbatim in `packages/contracts/src/schema.ts`.

### 6.3 Row Level Security (RLS) Policies

Added as part of the 0003_rls migration to close the biggest security hole from the v1 code review:

| Table | Public SELECT | Public INSERT | Admin only |
|---|---|---|---|
| `merchants` | `is_visible AND status='active'` | — | all writes |
| `coupons` | via merchant join (active + visible) | — | all writes |
| `categories` | all rows | — | all writes |
| `click_events` | — | allow anon | read only |
| `site_users` | — | allow anon (newsletter) | read, update |
| `merchant_private_data` | — | — | all access |
| `network_credentials` | — | — | all access |
| `llm_providers` | — | — | all access |
| `admin_users` | — | — | all access (self-read only for non-admins) |
| `audit_logs` | — | — | read only, immutable |

Admin access is gated by `auth.uid() IN (SELECT id FROM admin_users WHERE status='active')`.

### 6.4 Migration Strategy

- Drizzle introspects existing Supabase schema → generates baseline `0000_init.sql` (no-op, documents existing state)
- Additive migrations applied in order: `0001_add_merchant_columns`, `0002_create_networks`, `0003_rls_policies`, `0004_create_llm_providers`, `0005_create_content_tables`, `0006_create_tracking_tables`
- All migrations run via `pnpm --filter db migrate` against the live Supabase DB
- **Rollback:** every migration has a matching `down.sql` that drops the new columns/tables without touching existing data
- **Verification:** after each migration, a smoke test runs against the existing admin to confirm nothing broke

---

## 7. Multi-Provider LLM Registry (foundation)

### 7.1 Rationale

The PRD specifies "Claude as default, OpenAI as fallback" with a provider-agnostic interface. The user requirement is broader: **a dynamic registry where the admin can add any LLM provider (Claude, ChatGPT, Gemini, Grok, Manus, custom OpenAI-compatible endpoints) without code deploys.** This section implements that.

### 7.2 `llm_providers` Table

```sql
create table llm_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  adapter_key text not null check (adapter_key in ('anthropic','openai','google','xai','manus','custom')),
  model text not null,
  role text not null check (role in ('primary','secondary','fallback')),
  priority int not null default 0,
  is_active bool not null default true,
  api_key_ref text not null,
  config jsonb not null default '{}',
  last_used_at timestamptz,
  success_count int not null default 0,
  failure_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_llm_providers_role_priority on llm_providers(role, priority) where is_active;
```

### 7.3 `packages/llm` Structure

```
packages/llm/src/
├── adapters/
│   ├── base.ts             ← abstract LLMAdapter
│   ├── anthropic.ts        ← @anthropic-ai/sdk
│   ├── openai.ts           ← openai SDK
│   ├── google.ts           ← @google/genai (already in existing deps)
│   ├── xai.ts              ← OpenAI-compatible API
│   ├── manus.ts            ← HTTP client
│   ├── custom.ts           ← generic OpenAI-compatible endpoint
│   └── index.ts            ← adapter registry keyed by adapter_key
├── router.ts               ← selects provider by role + priority, handles fallback chain
├── vault.ts                ← resolves api_key_ref → actual key
└── types.ts                ← GenerateOpts, LLMResult, LLMAdapter interface
```

### 7.4 Runtime Behavior

```ts
// Caller (Subsystem 4, later)
const result = await llm.generate(prompt, {
  role: 'primary',
  maxTokens: 2000,
  temperature: 0.3,
});

// Router internals
// 1. SELECT * FROM llm_providers WHERE role='primary' AND is_active ORDER BY priority ASC
// 2. For each provider, instantiate its adapter and call generate()
// 3. On timeout/error, move to next provider in the list
// 4. If all 'primary' fail, retry with role='secondary'
// 5. If all 'secondary' fail, retry with role='fallback'
// 6. Log success/failure counts back to llm_providers row
```

### 7.5 Admin UI (built in S3, table exists now)

- **Settings → LLM Providers** page in the new Next.js admin (Subsystem 3)
- Table: name, adapter, model, role, priority, active, success rate, last used
- Add/edit form: dropdown for adapter_key, text inputs for model + name, paste API key (stored in vault), role dropdown, priority int, JSON config editor
- "Test" button fires a 1-token generation to verify the key works
- All mutations write to `audit_logs`

### 7.6 MVP Scope for This Spec

- `llm_providers` table created in migration `0004_create_llm_providers`
- `packages/llm` scaffold with `anthropic` and `google` adapters wired (both are in the existing dependencies)
- Router implemented but **nothing calls `llm.generate()` yet** — Subsystem 4 turns it on

---

## 8. Non-Functional Requirements

### 8.1 Performance
- LCP < 2.0s on merchant pages (measured via Lighthouse in CI)
- TTFB < 400ms via Vercel edge + ISR
- Search autocomplete responds within 300ms p95
- FMTC full sync completes within 10 minutes for 500 merchants
- ISR revalidation of a single merchant page completes within 5 seconds

### 8.2 Reliability
- Ingestion jobs retry with exponential backoff (3 attempts, 2× multiplier)
- Failed runs alert to Sentry after 3 consecutive failures
- All mutations are idempotent (dedupe hash prevents duplicates)
- Daily encrypted Supabase backups with 30-day retention (Supabase-managed)

### 8.3 Observability
- Sentry for error tracking with subsystem tags
- Logtail (or equivalent) for structured logs
- Internal `ingestion_runs` and `refresh_runs` tables for operational history
- GA4 for user-facing analytics

### 8.4 Security
- RLS policies enforced on all sensitive tables (see 6.3)
- All external inputs validated with Zod (API routes, webhooks, env vars)
- Click-out URLs validated before redirect (no open redirect)
- `dangerouslySetInnerHTML` always wrapped in `DOMPurify.sanitize()`
- Environment variables validated at startup — app refuses to boot with missing required vars
- API keys stored in vault, never in DB plaintext or env files committed to git
- HTTPS only, HSTS enabled
- Rate limiting at Vercel edge: 60 req/min per IP on public routes, 10 req/min on API routes

### 8.5 Accessibility
- WCAG 2.1 AA minimum
- Verified via `@axe-core/playwright` in CI against homepage + sample merchant page + sample category page
- Manual keyboard nav test before production deploy

---

## 9. Migration & Cutover Plan

### 9.1 Week 1 — Foundation
1. Create empty `couponscode-ai` monorepo structure locally
2. Move existing code into `apps/admin-legacy/` (one-time folder move + path fixups)
3. Verify existing admin still builds and runs from its new location
4. Scaffold `apps/web`, `apps/ingestion`, `packages/contracts`, `packages/db`, `packages/llm`, `packages/ui`
5. Drizzle introspect existing Supabase → baseline migration
6. Apply additive migrations `0001`–`0006` to the live Supabase DB
7. Run smoke tests against existing admin — must continue to function

### 9.2 Week 2 — SEO Core
1. `apps/web` homepage, merchant page, category page rendering from Drizzle
2. JSON-LD generator with validation tests
3. Sitemap + robots.txt
4. Click-out flow + `/api/click` endpoint
5. Newsletter modal + `/api/newsletter` endpoint
6. Deploy to Vercel preview

### 9.3 Week 3 — Ingestion + Polish
1. `NetworkAdapter` + FMTC + 3 priority adapters
2. Inngest cron jobs running against live Supabase
3. Date-refresh job + ISR revalidation
4. Manual override logic end-to-end
5. RLS verification (run a test script that attempts unauthorized access and confirms it's blocked)
6. Production deploy of `apps/web` to `couponscode.ai`
7. Existing admin still pointed at `admin.couponscode.ai` (or `/admin-legacy` subpath), unchanged

### 9.4 DNS Cutover
- `couponscode.ai` → new Vercel project (`apps/web`)
- `admin.couponscode.ai` → existing Vercel project (`apps/admin-legacy`), same DB
- No downtime — both apps are deployed before DNS changes

---

## 10. Out of Scope (explicit, to prevent scope creep)

- Subsystem 3 — Admin Panel migration (next spec)
- Subsystem 4 — LLM drafting pipeline execution (table + package exist, calls deferred)
- Subsystem 5 — Paid traffic infrastructure (`sessions` and `conversions` tables exist but unused)
- User accounts, favorites, cashback
- User-submitted coupons
- Multi-language UI
- Browser extension
- Broken-link detection
- A/B testing framework
- Remaining 5 network adapters (Partnerize, Rakuten, ShareASale, FlexOffers, Pepperjam)

---

## 11. Open Questions (to resolve before implementation)

1. **GitHub repo creation** — user to create empty private repo at `maorfeld10/couponscode-ai` via web UI, then paste remote URL for `git remote add origin`.
2. **Vercel projects** — user to create two Vercel projects (`couponscode-web` and `couponscode-admin-legacy`) and hand over access, OR grant the dev access to their Vercel account.
3. **Domain DNS access** — user controls DNS for `couponscode.ai`; cutover plan needs DNS TTL lowered to 300s 24h before cutover.
4. **FMTC credentials** — user confirms credentials are available and have access to full merchant feed.
5. **Inngest account** — user to create account, provide `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY`.
6. **Sentry account** — optional at MVP, but recommended. User to create project and provide DSN.
7. **Anthropic API key** — stored in vault now, used in Subsystem 4.

---

## 12. Success Criteria Recap

At the end of the 3-week window, the following must be true:

- [ ] New monorepo at `maorfeld10/couponscode-ai` (private)
- [ ] Existing Vite admin runs unchanged from `apps/admin-legacy/`, same Supabase DB
- [ ] `couponscode.ai` serves Next.js 14 pages with real SSR HTML
- [ ] 200+ merchant pages indexed with full Schema.org JSON-LD
- [ ] Sitemap index at `/sitemap.xml` with per-type children, daily `lastmod`
- [ ] FMTC ingestion cron running every 6h, writing to `merchants`/`coupons`
- [ ] 3 additional network adapters (Awin, CJ, Impact) functional
- [ ] Daily date-refresh job running + ISR revalidation wired up
- [ ] Click-out flow logging to `click_events`
- [ ] Newsletter signup writing to `site_users`
- [ ] RLS policies in place and verified
- [ ] LCP < 2.0s, CLS < 0.05, INP < 200ms on Lighthouse
- [ ] `llm_providers` table + `packages/llm` scaffold in place (inactive)
- [ ] Zero regressions in existing Vite admin

---

## 13. Next Steps (post-approval)

1. User reviews this spec and approves (or requests changes)
2. Invoke `superpowers:writing-plans` skill to produce a detailed implementation plan with per-step TDD checkpoints
3. User creates empty private GitHub repo at `maorfeld10/couponscode-ai`
4. Begin Week 1 implementation
