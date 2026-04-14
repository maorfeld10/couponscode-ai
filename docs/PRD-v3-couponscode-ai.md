# couponscode.ai — Product Requirements Document v3

**Version:** 3.0 (revised)
**Date:** 2026-04-13
**Status:** Approved for build
**Supersedes:** PRD v1.0, PRD v2.0
**Owner:** Product + Engineering

---

## 1. Executive Summary

**couponscode.ai** is an SEO-first coupon and deals aggregator designed to dominate long-tail merchant search queries ("Nike promo code", "Macy's coupons April 2026") and generate sustainable revenue through affiliate commissions across 8+ networks.

This v3 PRD supersedes v1 and v2, incorporating strategic decisions made during design review:

- **Architecture path chosen: Hybrid (Path C)** — a new Next.js 14 frontend and ingestion pipeline are built alongside the existing Vite-based admin panel. All three apps share one Supabase database. The legacy admin continues running unchanged during the transition and is migrated into Next.js in a later phase (Subsystem 3).
- **Database evolved, not replaced** — all existing merchants, coupons, content, and merchant logos are preserved. Schema changes are strictly additive (new columns, new tables, new RLS policies). No destructive migrations.
- **Multi-provider LLM registry (not Claude + OpenAI only)** — a dynamic admin-managed registry supporting Claude, ChatGPT, Gemini, Grok, Manus, and any OpenAI-compatible custom endpoint. The admin can add providers at runtime without code deploys.
- **MVP scope narrowed to 200 merchants** (from the PRD v2 target of 2,000) to fit the Supabase free tier and deliver a credible first milestone within 3 weeks.
- **Honest 10-week overall timeline** for all five subsystems (PRD v2 stated 4–6 weeks; that is not realistic for one developer + AI pairing).
- **SEO-first mandate:** full server-rendered HTML with Schema.org JSON-LD on every page, Core Web Vitals targets are gating requirements, daily freshness signals via an automated date-refresh job.
- **Security hardened** — Row Level Security policies introduced for every sensitive table, closing the biggest gap in v1.

---

## 2. Locked Strategic Decisions

These decisions are final unless explicitly revisited:

| Decision | Value |
|---|---|
| Architecture strategy | Path C (Hybrid) — new Next.js frontend + ingestion, legacy Vite admin preserved |
| Frontend framework | Next.js 14 App Router, React Server Components where possible |
| ORM | Drizzle |
| Database | Supabase Postgres (existing instance, evolved via additive migrations) |
| Background jobs | Inngest (with optional future migration to n8n via webhook triggers) |
| Hosting | Vercel for Next.js apps, Supabase for DB |
| Auth | Supabase Auth (admin only at MVP) |
| Email | Resend |
| Object storage | Supabase Storage (existing) |
| Monitoring | Sentry + Logtail |
| Monorepo tool | pnpm workspaces (Turborepo deferred) |
| LLM strategy | Multi-provider registry with dynamic admin UI |
| MVP merchant count | 200 |
| Launch language | English (hreflang stubs reserved for v2) |
| User model | Newsletter-only at MVP |
| Timeline | 10 weeks to all five subsystems (Subsystems 1+2 in first 3 weeks) |

---

## 3. Goals & KPIs

### 3.1 Business Goals
- Reach **200+ indexed merchant pages** within 3 weeks of launch (Week 3 milestone)
- Reach **2,000+ indexed merchant pages** within 90 days
- Generate **100,000+ monthly organic sessions** within 6 months
- Achieve **3%+ click-out rate** on merchant pages
- Sustainable affiliate revenue across 8+ networks

### 3.2 Key Performance Indicators

| Metric | Month 1 (Week 3) | Month 3 | Month 6 |
|---|---|---|---|
| Indexed merchant pages | 200 | 2,000+ | 3,500+ |
| Monthly organic sessions | — | 30,000 | 100,000+ |
| Click-out CTR | — | 2.5% | 3.5% |
| Newsletter conversion | — | 1.5% | 3% |
| Daily content published | — | 5–10 | 10–15 |
| Affiliate revenue (USD/mo) | — | $2K | $15K+ |
| Core Web Vitals — LCP | <2.0s | <2.0s | <2.0s |
| Core Web Vitals — CLS | <0.05 | <0.05 | <0.05 |
| Core Web Vitals — INP | <200ms | <200ms | <200ms |

---

## 4. Scope

### 4.1 In Scope (MVP, 3-week window — Subsystems 1 + 2)

- New Next.js 14 public site with full SSR/ISR
- Homepage, merchant pages, category pages, blog stub, legal pages, search
- Full Schema.org JSON-LD on every page (Store, Offer, FAQ, Article, Organization, BreadcrumbList, CollectionPage)
- Sitemap index with per-type sub-sitemaps, auto-regenerated daily
- Daily date-refresh job with ISR revalidation
- Dual-tab affiliate click-out flow
- Newsletter signup with exit-intent and email modals
- `NetworkAdapter` interface + FMTC ingestion + 3 priority networks (Awin, CJ, Impact)
- Deduplication, normalization, manual-override protection
- Encrypted credential vault
- Additive DB migrations preserving existing data
- Row Level Security policies on every sensitive table
- Multi-provider LLM registry scaffold (`llm_providers` table + `packages/llm` package, inactive at MVP)
- Existing Vite admin relocated into `apps/admin-legacy/` and kept running unchanged

### 4.2 In Scope (Weeks 4–10 — Subsystems 3, 4, 5)

- **Subsystem 3 — Admin Panel migration** (weeks 4–5): rebuild existing admin in Next.js with Supabase Auth middleware, DataTable, CSV import/export, ingestion console, LLM providers settings UI, audit logs viewer
- **Subsystem 4 — Content Pipeline** (weeks 6–7): LLM drafter, topic queue, content review queue UI, approval workflow, merchant About/FAQ generation
- **Subsystem 5 — Paid Traffic Infrastructure** (weeks 8–9): UTM auto-tagging, sub-ID propagation, S2S postback receiver, conversion mapping, outbound postbacks, pixel deployment, Consent Mode v2, attribution dashboard
- **Remaining 5 network adapters** (weeks 8–9): Partnerize, Rakuten, ShareASale, FlexOffers, Pepperjam
- **Week 10** — launch polish, security audit, monitoring, production cutover

### 4.3 Out of Scope (deferred to v1.1 and beyond)

| Feature | Phase |
|---|---|
| User accounts, favorites, cashback | v1.1 |
| User-submitted coupons with voting | v1.1 |
| Automated broken-link detection | v1.1 |
| A/B testing framework | v1.2 |
| Personalization | v1.2 |
| Email digest automation | v1.2 |
| Multi-language UI (ES, FR, DE) with hreflang | v2 |
| Browser extension | v2 |
| Mobile app (React Native) | v2 |
| Price tracking and price-drop alerts | v2 |

---

## 5. Architecture Overview (Path C — Hybrid)

```
┌─────────────────────────────────────────────────────────┐
│              couponscode.ai (Vercel, Next.js 14)        │
│                    [NEW - Subsystem 2]                  │
│  Public site with SSR/ISR, JSON-LD, sitemap, click-out  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│           Supabase Postgres (EXISTING, evolved)         │
│  merchants, coupons, content, click_events, sessions,   │
│  conversions, llm_providers, networks, ...              │
└─────────────────────────────────────────────────────────┘
                           ▲
                           │
┌─────────────────────────────────────────────────────────┐
│         Ingestion Service (Node + Inngest)              │
│                 [NEW - Subsystem 1]                     │
│  NetworkAdapter pattern, FMTC + Awin + CJ + Impact      │
└─────────────────────────────────────────────────────────┘
                           ▲
                           │
┌─────────────────────────────────────────────────────────┐
│       EXISTING Vite admin (kept running, unchanged)     │
│  Migrated into apps/admin-legacy/, same Supabase DB     │
└─────────────────────────────────────────────────────────┘
```

### 5.1 Why Hybrid

- **Preserves existing investment**: 200 merchants, coupons, content, logos, admin workflows all survive
- **Fast path to SEO wins**: new Next.js frontend can go live in 3 weeks without waiting for admin migration
- **Zero downtime migration**: both apps run in parallel during the 10-week build
- **Clean separation**: when Subsystem 3 completes, the legacy admin is simply deleted

### 5.2 Repository Structure

```
couponscode-ai/                          ← private GitHub repo: maorfeld10/couponscode-ai
├── apps/
│   ├── web/                             ← NEW: Next.js 14 public site
│   ├── ingestion/                       ← NEW: Node + Inngest service
│   └── admin-legacy/                    ← EXISTING Vite admin, moved as-is
├── packages/
│   ├── contracts/                       ← Drizzle schema + TS types + Zod + events
│   ├── db/                              ← Drizzle client + migrations
│   ├── llm/                             ← Multi-provider LLM registry
│   └── ui/                              ← Shared UI components
├── docs/
│   ├── PRD-v3-couponscode-ai.md         ← this document
│   └── superpowers/
│       ├── specs/                       ← design specs (per subsystem)
│       └── plans/                       ← implementation plans
├── .github/workflows/
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── .gitignore
├── CLAUDE.md
└── README.md
```

---

## 6. Subsystem Breakdown

### 6.1 Subsystem 1 — Ingestion Pipeline (Weeks 1–3)

**Purpose:** Aggregate merchant and coupon data from FMTC and affiliate networks into a unified, deduplicated data store.

**Scope at MVP:**
- `NetworkAdapter` abstract base class and adapter registry
- FMTC datafeed integration (Tier 1, master source, sync every 6h)
- 3 priority network adapters: Awin, CJ, Impact (Tier 2, sync every 1–2h)
- Normalizer service mapping raw network records to shared schema
- Dedupe service: merchant key = lowercased domain; coupon key = sha256(merchant_id + code + deal_type)
- Manual override protection (admin-locked fields never overwritten)
- Scheduled jobs: FMTC every 6h, priority networks every 1–2h, expiration sweep daily, date-refresh daily, failed-job retry every 30 min
- Encrypted credential vault
- Job logging to `ingestion_runs` table

**NetworkAdapter interface contract:**
```ts
abstract class NetworkAdapter {
  abstract readonly key: string;
  abstract fetchMerchants(): Promise<RawMerchant[]>;
  abstract fetchCoupons(merchantExternalId?: string): Promise<RawCoupon[]>;
  abstract getTrackingLink(merchantId: string, deepLink?: string, subId?: string): string;
  abstract healthCheck(): Promise<HealthStatus>;
}
```

Adding a new network adapter requires a single file implementing this interface plus one line in the registry — no other code changes.

**Deferred to weeks 8–9:** Partnerize, Rakuten, ShareASale, FlexOffers, Pepperjam adapters.

**Acceptance criteria:**
- FMTC sync populates at least 500 merchants in under 10 minutes
- Each adapter can be triggered manually and writes at least one merchant/coupon
- Running the same sync twice does not create duplicates
- Manual-override fields are never overwritten by automated syncs
- Every job execution logs to `ingestion_runs`

### 6.2 Subsystem 2 — Frontend + SEO Core (Weeks 1–3)

**Purpose:** Render ingested data as a public-facing website optimized for organic search.

**Routes:**

| Route | Rendering | Revalidation |
|---|---|---|
| `/` | SSR + ISR | 6 hours |
| `/[slug]-coupons` | SSR + ISR | 24 hours |
| `/category/[slug]` | SSR + ISR | 24 hours |
| `/blog/[slug]` | SSR + ISR | 24 hours (stub in MVP) |
| `/search` | Dynamic SSR | none |
| `/legal/[slug]` | SSG | build time |
| `/sitemap.xml` | Dynamic | daily |
| `/robots.txt` | Static | — |
| `/api/click` | Edge | — |
| `/api/newsletter` | Node | — |
| `/api/revalidate` | Node | — |

**SEO requirements (all non-negotiable):**

1. **Full server-rendered HTML bodies** — page body contains real merchant data and coupons on first response; no client-side fetching for primary content.
2. **Schema.org JSON-LD per page type:**
   - Homepage: `Organization`, `WebSite` (with `SearchAction`), `BreadcrumbList`
   - Merchant page: `Store`, `Offer` (one per coupon, with `validFrom`, `validThrough`, `priceCurrency`, `availability`), `FAQPage`, `BreadcrumbList`
   - Category page: `CollectionPage`, `ItemList`, `BreadcrumbList`
   - Blog post: `Article`, `BreadcrumbList`
3. **Canonical URLs** on every page via Next.js metadata API.
4. **Open Graph + Twitter Card** metadata on every page.
5. **Hreflang stub structure** reserved for v2 multi-language.
6. **Sitemap index** at `/sitemap.xml` pointing to `sitemap-merchants.xml`, `sitemap-categories.xml`, `sitemap-blog.xml`, `sitemap-legal.xml`, regenerated daily with accurate `lastmod`.
7. **HTTP status codes:** 200 active, 404 missing, 410 permanently expired, 301 slug changes.

**Core Web Vitals (gating requirements):**
- LCP < 2.0s, CLS < 0.05, INP < 200ms, TTFB < 400ms

**Design standards (UI/UX Pro Max guide):**
- Accessibility: contrast ≥ 4.5:1, visible focus rings (2–4px), ARIA labels on icon-only buttons, keyboard nav, `prefers-reduced-motion`
- Touch targets: ≥ 44×44, 8px spacing, visual feedback within 100ms
- Typography: base 16px, line-height 1.5, font-display swap
- Animation: 150–300ms, meaningful motion only
- Forms: visible labels, inline errors, helper text

**Daily date-refresh job (SEO freshness loop):**
- Runs at 03:00 UTC via Inngest cron
- Updates `last_updated` on all active merchants and `last_seen_at` on active coupons
- Triggers ISR revalidation via `/api/revalidate`
- Rewrites sub-sitemaps with fresh `lastmod`
- Logs run to `refresh_runs` table
- User-visible "Updated {Month Day, Year}" text is computed from `last_updated` at render time

**Click-out flow (dual-tab):**
1. User clicks "Show Code" or "Get Deal"
2. Client POSTs to `/api/click` with merchant/coupon/type/session
3. Server writes `click_events` row, returns `{ outboundUrl, couponCode }`
4. Client opens new tab to `/{slug}-coupons?openCoupon={id}` (keeps user on site)
5. Current tab navigates to `outboundUrl`
6. Popup-blocker fallback: open modal in current tab
7. Outbound URL validated server-side (no open redirects)

### 6.3 Subsystem 3 — Admin Panel (Weeks 4–5)

**Purpose:** Rebuild the operational cockpit in Next.js with role-based access.

**Scope:**
- Auth-gated admin app at `/admin` with roles (`super_admin`, `editor`, `viewer`)
- Dashboard (KPIs, pending reviews, failed jobs, audit log)
- Merchant management (list, search, filter, bulk edit, detail tabs)
- Coupon management (list, filter, manual entry, bulk actions)
- Content review queue UI shell (logic in Subsystem 4)
- Ingestion console (per-network status, manual trigger, credentials)
- LLM Providers settings UI (add/edit/test providers)
- Campaigns + UTM builder
- Reports (revenue by source/network/campaign/merchant, CSV export)
- Audit log viewer
- CSV import/export

**Migration strategy:** rebuild routes one-by-one in `apps/web/app/admin/*`, delete corresponding routes from `apps/admin-legacy/` after verification. When fully migrated, delete `apps/admin-legacy/`.

### 6.4 Subsystem 4 — Content Pipeline (Weeks 6–7)

**Purpose:** Generate 5–10 SEO-optimized editorial content pieces per day via LLM drafting with strict editor approval.

**Scope:**
- Topic queue populated by trending merchants, upcoming holidays, expiring deals, manual editor input, GSC keyword opportunities
- LLM drafter service consuming queue items via the multi-provider registry
- Versioned prompt template library in source control
- Draft storage in `content_drafts` with status workflow (`pending_review` → `approved`/`rejected`/`scheduled`/`published`)
- Content review queue UI (rendered inside admin shell)
- Approve / reject / regenerate / schedule actions
- Merchant About section + FAQ generation on merchant create + monthly refresh

**Multi-provider LLM routing:**
- Router selects active providers by `role` (primary/secondary/fallback) and `priority`
- On timeout or error, falls through to the next provider automatically
- Logs success/failure counts back to `llm_providers` row for cost tracking
- All drafts carry the `llm_provider` and `llm_model` that generated them

### 6.5 Subsystem 5 — Paid Traffic Infrastructure (Weeks 8–9)

**Purpose:** Make every paid click measurable end-to-end from ad impression through affiliate conversion.

**Scope:**
- UTM auto-tagging middleware (persistent session cookie + `sessions` table)
- Sub-ID propagation to affiliate click URLs per network format
- Inbound S2S postback receiver at `/api/postback` with per-network signature validation
- Conversion mapping: postback → click_event → session → UTM
- Outbound postbacks: Google Ads (gclid), Meta CAPI, Reddit Conversion API, Bing UET offline conversions
- Pixel deployment: GA4, Google Ads, Meta, Bing, Reddit, TikTok + GTM container
- Consent Mode v2 (GDPR/CCPA)
- Attribution dashboard (revenue by source/network/campaign, ROAS, funnel, CSV export)

---

## 7. Multi-Provider LLM Registry

A dynamic admin-managed LLM registry supporting any provider, added at runtime without code deploys.

### 7.1 Database Table

```sql
create table llm_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,                    -- "Claude Sonnet 4.6 (main)"
  adapter_key text not null
    check (adapter_key in ('anthropic','openai','google','xai','manus','custom')),
  model text not null,                    -- "claude-sonnet-4-6"
  role text not null
    check (role in ('primary','secondary','fallback')),
  priority int not null default 0,        -- lower = tried first within same role
  is_active bool not null default true,
  api_key_ref text not null,              -- vault reference (never plaintext)
  config jsonb not null default '{}',     -- temperature, max_tokens, etc.
  last_used_at timestamptz,
  success_count int not null default 0,
  failure_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 7.2 Supported Adapters at Launch

| Adapter Key | Provider | Notes |
|---|---|---|
| `anthropic` | Anthropic Claude | `@anthropic-ai/sdk` |
| `openai` | OpenAI ChatGPT | `openai` SDK |
| `google` | Google Gemini | `@google/genai` |
| `xai` | xAI Grok | OpenAI-compatible API |
| `manus` | Manus | HTTP client |
| `custom` | Any OpenAI-compatible endpoint | DeepSeek, Mistral, local Llama, etc. |

### 7.3 Admin UI

Located at **Admin → Settings → LLM Providers** (built in Subsystem 3):
- List view: name, adapter, model, role, priority, active, success rate, last used
- Add/edit form: adapter dropdown, model name, API key paste (stored in vault, never shown again), role, priority, JSON config editor
- Test button: fires a 1-token generation to verify the key
- All mutations audit-logged

### 7.4 Runtime Behavior

```
caller: llm.generate(prompt, { role: 'primary', maxTokens: 2000 })

router:
  1. SELECT * FROM llm_providers
     WHERE role='primary' AND is_active
     ORDER BY priority ASC
  2. Try each provider in order
  3. On error/timeout, move to next
  4. If all primary fail → retry with role='secondary'
  5. If all secondary fail → retry with role='fallback'
  6. Log success/failure back to llm_providers row
```

### 7.5 MVP Scaffold

- `llm_providers` table created in migration `0004_create_llm_providers`
- `packages/llm` with `anthropic` and `google` adapters wired (both already in existing dependencies)
- Router implemented
- **No calls made until Subsystem 4** — table and package exist, inactive at MVP

---

## 8. Database Schema

All changes are strictly additive. Existing data is preserved.

### 8.1 Columns Added to Existing Tables

| Table | Column | Type | Default | Purpose |
|---|---|---|---|---|
| `merchants` | `domain` | text | null | Dedupe key (lowercased) |
| `merchants` | `primary_network_id` | uuid fk | null | Owning network |
| `merchants` | `manual_override_fields` | jsonb | `'{}'` | Fields locked from automated overwrites |
| `merchants` | `last_updated` | timestamptz | `now()` | SEO freshness |
| `merchants` | `priority_score` | int | 0 | Ranking |
| `coupons` | `source_network` | text | null | Network source |
| `coupons` | `external_id` | text | null | Network's coupon ID |
| `coupons` | `last_seen_at` | timestamptz | `now()` | Freshness |
| `coupons` | `manual_override` | bool | false | Lock flag |
| `coupons` | `dedupe_hash` | text unique | null | sha256 dedupe |

### 8.2 New Tables

| Table | Purpose |
|---|---|
| `networks` | Affiliate network registry |
| `network_credentials` | Encrypted credential refs |
| `ingestion_runs` | Job execution log |
| `refresh_runs` | Date-refresh job log |
| `llm_providers` | Multi-provider LLM registry |
| `content_drafts` | LLM-generated drafts (pending review) |
| `content_published` | Approved, published content |
| `topic_queue` | Content backlog |
| `sessions` | UTM + session persistence |
| `conversions` | S2S postback records |

### 8.3 Row Level Security Policies

Enforced on all sensitive tables (closes biggest gap in v1):

| Table | Public SELECT | Public INSERT | Admin only |
|---|---|---|---|
| `merchants` | `is_visible AND status='active'` | — | all writes |
| `coupons` | via merchant join (active + visible) | — | all writes |
| `categories` | all rows | — | all writes |
| `click_events` | — | anon allowed | read only |
| `site_users` | — | anon allowed (newsletter) | read, update |
| `merchant_private_data` | — | — | all access |
| `network_credentials` | — | — | all access |
| `llm_providers` | — | — | all access |
| `admin_users` | — | — | all access |
| `audit_logs` | — | — | read only, immutable |

Admin access gated by `auth.uid() IN (SELECT id FROM admin_users WHERE status='active')`.

### 8.4 Migration Plan

- `0000_init` — Drizzle introspection baseline (no-op, documents existing state)
- `0001_add_merchant_coupon_columns` — additive column additions
- `0002_create_networks_tables` — `networks`, `network_credentials`, `ingestion_runs`, `refresh_runs`
- `0003_rls_policies` — all RLS policies
- `0004_create_llm_providers` — multi-provider registry
- `0005_create_content_tables` — `content_drafts`, `content_published`, `topic_queue`
- `0006_create_tracking_tables` — `sessions`, `conversions`

Every migration has a matching `down.sql` rollback. Executed via `pnpm --filter db migrate`.

---

## 9. SEO Strategy

### 9.1 On-Page
- Semantic HTML: one H1 per page, logical H2/H3 hierarchy
- Programmatic slugs: `/{merchant-slug}-coupons`, `/category/{slug}`, `/blog/{slug}`
- Canonical URLs on every page
- Internal linking: "Similar Stores", categories, contextual blog links
- Auto-generated breadcrumbs
- Image alt text auto-populated from merchant name + context
- Lazy loading + WebP/AVIF

### 9.2 Structured Data (Schema.org JSON-LD, server-rendered)

| Page Type | Schemas |
|---|---|
| Homepage | `Organization`, `WebSite` (with `SearchAction`), `BreadcrumbList` |
| Merchant page | `Store`, `Offer` per coupon, `FAQPage`, `BreadcrumbList`, future `AggregateRating` |
| Coupon modal | `DiscountOffer` with validity + currency |
| Blog post | `Article`, `BreadcrumbList`, `Author`, `Publisher` |
| Category page | `CollectionPage`, `BreadcrumbList`, `ItemList` |
| FAQ blocks | `FAQPage` |

### 9.3 Technical SEO
- Sitemap index split by type: `sitemap-merchants.xml`, `sitemap-blog.xml`, `sitemap-categories.xml`, `sitemap-legal.xml`
- Daily sitemap regeneration with accurate `lastmod`
- `robots.txt` with explicit allow rules
- HTTP status codes: 200, 301, 404, 410
- OG + Twitter Card meta on every page
- Hreflang stubs reserved for v2

### 9.4 Programmatic SEO Content Minimums
- Merchant page: 400+ words unique content
- Category page: 300+ words intro + curated list
- Blog post: 800+ words
- Each merchant page surfaces ≥ 3 unique data points (founded year, HQ, payment methods, shipping, returns, etc.)

---

## 10. Paid Traffic & Conversion Tracking (Subsystem 5)

### 10.1 Supported Channels
Google Ads, Bing Ads, Meta (Facebook + Instagram), Reddit Ads, Taboola, Outbrain, SourceKnowledge, Zeropark, RTX Platform, MGID, RevContent, PropellerAds, Email/Newsletter sponsorships

### 10.2 UTM Auto-Tagging
- Centralized UTM builder in admin
- Session cookie captures UTMs on first paid landing
- UTMs appended to affiliate click-outs as sub-IDs (per-network format: Awin `clickref`, CJ `sid`, Impact `subId1`, etc.)

### 10.3 Server-Side Postbacks
- Inbound endpoint: `/api/postback?network={x}&sid={subid}&amount={x}&currency=USD`
- Per-network signature validation
- Conversion mapping by sub-ID → click_event → session → UTM
- Outbound postbacks to: Google Ads (gclid), Meta CAPI, Reddit Conversion API, Bing UET

### 10.4 Pixel & Tag Management
- GTM container site-wide
- Native pixels: GA4, Google Ads, Meta, Bing UET, Reddit, TikTok
- Consent Mode v2 (GDPR/CCPA) suppresses pixels until consent granted

### 10.5 Attribution Dashboard
- Revenue by source/network/campaign/merchant/day
- ROAS by campaign (UTM-level)
- Click → conversion funnel
- CSV export

---

## 11. Security & Compliance

- **Supabase Auth** with email + MFA for admin users
- **Row Level Security** on all sensitive tables (see 8.3)
- **Credentials vault** (Supabase Vault or equivalent) for affiliate network and LLM API keys — never plaintext in DB or env files
- **Signature validation** on all S2S postback endpoints
- **Rate limiting** at Vercel edge: 60 req/min per IP on public routes, 10 req/min on API routes
- **CSRF protection** on admin forms
- **HTML sanitization**: all `dangerouslySetInnerHTML` wrapped in `DOMPurify.sanitize()` (closes v1 XSS gap)
- **Open redirect protection**: all click-out URLs validated server-side before redirect
- **Env var validation** at startup — app refuses to boot with missing required vars
- **Cookie consent** banner with Consent Mode v2
- **Legal pages** auto-generated: Privacy Policy, Terms of Service, Affiliate Disclosure
- **Audit log** for every admin mutation
- **Daily encrypted Supabase backups**, 30-day retention
- **Zod validation** on every external input (API routes, webhooks, env vars)

---

## 12. Performance & Scalability

### 12.1 Targets
- LCP < 2.0s globally
- TTFB < 400ms via edge caching
- CLS < 0.05
- INP < 200ms
- Sustainable concurrent users: 5,000+
- Sustainable indexed pages: 10,000+
- FMTC full sync: 500 merchants in < 10 minutes

### 12.2 Optimizations
- ISR with 24h revalidation on merchant + category pages
- Edge caching via Vercel for static assets and HTML
- WebP/AVIF images, lazy loading, responsive srcset
- Database indexes on `slug`, `status`, `priority_score`, `last_updated`, `dedupe_hash`
- Postgres connection pooling via Supabase pooler
- Background jobs decoupled from web requests via Inngest

---

## 13. Build Roadmap (10 Weeks, 1 Developer + AI Pairing)

| Week | Focus | Deliverable |
|---|---|---|
| **1** | Foundation | Monorepo created, existing Vite code moved into `apps/admin-legacy/`, legacy admin verified working, Drizzle introspection baseline, migrations 0001–0006 applied |
| **2** | Frontend SEO core | Homepage, merchant page, category page rendering from Drizzle with full JSON-LD, sitemap, click-out, newsletter, Vercel preview deploy |
| **3** | Ingestion + launch | FMTC + 3 network adapters functional, date-refresh job, RLS verified, production deploy, first 200 merchants live on couponscode.ai |
| **4–5** | Admin migration (Subsystem 3) | Rebuild admin routes in Next.js, LLM providers settings UI, ingestion console, reports |
| **6–7** | Content pipeline (Subsystem 4) | LLM drafter active, topic queue, review queue UI, approval workflow, merchant About/FAQ generation |
| **8–9** | Paid traffic (Subsystem 5) + 5 remaining adapters | UTM auto-tagging, S2S postbacks, pixel deployment, attribution dashboard, Partnerize/Rakuten/ShareASale/FlexOffers/Pepperjam adapters |
| **10** | Launch polish | Security audit, monitoring, performance tuning, production cutover, delete `apps/admin-legacy/` |

---

## 14. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Google penalty for thin programmatic content | High | 400-word minimum per merchant page, unique LLM-drafted blocks, strict editor review, full schema coverage |
| Affiliate network ToS violation | High | Strict adherence to branding rules, affiliate disclosure on every page |
| Affiliate link rot | Medium | Manual review at MVP, automated detection in v1.1 |
| LLM hallucination / inaccurate content | Medium | Editor-gated approval workflow, no auto-publish |
| Single-developer bottleneck | High | Phased weekly milestones, strict scope gates, AI pairing |
| FMTC data quality issues | Medium | Validation layer on ingestion, manual override capability |
| Paid traffic ROI negative early | Medium | Start with Search/Bing on long-tail brand queries before scaling DSPs |
| Legacy admin breaks during monorepo move | High | Move is a folder relocation with path fixups only; smoke test after move; rollback via `git reset` if needed |
| Supabase free tier hit limits | Medium | Upgrade to Pro ($25/mo) when merchant count > 500 or DB > 400MB |
| RLS policy misconfiguration locks out admin | High | Apply policies in staging first, test with a non-admin account, keep service_role key available as emergency backdoor |

---

## 15. Open Questions / Prerequisites

Before build starts, the user must resolve:

1. **Create empty private GitHub repo** at `maorfeld10/couponscode-ai`, provide remote URL
2. **Create two Vercel projects** (`couponscode-web`, `couponscode-admin-legacy`) OR grant dev access to Vercel account
3. **Lower `couponscode.ai` DNS TTL to 300s** 24 hours before DNS cutover
4. **Confirm FMTC credentials** available with full merchant feed access
5. **Create Inngest account**, provide `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY`
6. **Sentry project** (optional at MVP, recommended) — provide DSN
7. **Anthropic API key** for Subsystem 4 (stored in vault)
8. **Install pnpm** on dev machine: `npm install -g pnpm`

---

## 16. Tech Stack (Locked)

| Layer | Choice | Version |
|---|---|---|
| Frontend framework | Next.js | 14+ App Router |
| Language | TypeScript | 5.8+, strict mode |
| ORM | Drizzle | latest |
| Database | Supabase Postgres | existing |
| Background jobs | Inngest | latest |
| Hosting | Vercel + Supabase | — |
| Auth | Supabase Auth | — |
| Email | Resend | — |
| Object storage | Supabase Storage | — |
| Monitoring | Sentry + Logtail | — |
| CSS | Tailwind | 4 |
| Validation | Zod | latest |
| Monorepo | pnpm workspaces | latest |
| LLM (default) | Anthropic Claude | via registry |
| LLM (fallback) | Google Gemini | via registry |

---

## 17. Success Criteria — Week 3 Milestone Gate

The 3-week milestone is complete when all of the following are true:

- [ ] Private GitHub repo `maorfeld10/couponscode-ai` exists
- [ ] Existing Vite admin runs unchanged from `apps/admin-legacy/` on the same Supabase DB
- [ ] `couponscode.ai` serves Next.js 14 pages with real SSR HTML (verified via `curl`)
- [ ] 200+ merchant pages live with full Schema.org JSON-LD (validated against Google Rich Results Test)
- [ ] Sitemap index at `/sitemap.xml` with per-type children, daily `lastmod`
- [ ] FMTC ingestion cron running every 6h, writing to `merchants`/`coupons`
- [ ] 3 additional network adapters (Awin, CJ, Impact) functional
- [ ] Daily date-refresh job running with ISR revalidation
- [ ] Click-out flow logging to `click_events`, outbound URLs validated
- [ ] Newsletter signup writing to `site_users`
- [ ] RLS policies in place and verified via unauthorized-access test
- [ ] Core Web Vitals: LCP < 2.0s, CLS < 0.05, INP < 200ms on Lighthouse
- [ ] `llm_providers` table + `packages/llm` scaffold in place (inactive)
- [ ] Zero regressions in existing Vite admin

---

## Appendix A — API Contracts (Week 3 Scope)

### Internal HTTP Endpoints

| Endpoint | Method | Owner | Purpose |
|---|---|---|---|
| `/api/click` | POST | Subsystem 2 | Log click_event, return outbound URL |
| `/api/newsletter` | POST | Subsystem 2 | Newsletter signup |
| `/api/revalidate` | POST | Subsystem 2 | ISR revalidation webhook (called by date-refresh job) |
| `/api/sitemap-merchants.xml` | GET | Subsystem 2 | Merchant sitemap |
| `/api/sitemap-categories.xml` | GET | Subsystem 2 | Category sitemap |
| `/api/sitemap-blog.xml` | GET | Subsystem 2 | Blog sitemap (stub) |
| `/api/sitemap-legal.xml` | GET | Subsystem 2 | Legal pages sitemap |

### Internal Events (Inngest)

| Event | Producer | Consumer | Payload |
|---|---|---|---|
| `ingestion.merchant.upserted` | Subsystem 1 | Subsystem 4 (later) | `{ merchantId, isNew }` |
| `ingestion.run.completed` | Subsystem 1 | Subsystem 3 (later) | `{ runId, network, records, status }` |
| `refresh.completed` | Subsystem 2 | Subsystem 3 (later) | `{ runId, itemsUpdated }` |

### Environment Variables

```
# Database
DATABASE_URL
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL

# LLM providers (placeholders, real keys live in vault)
ANTHROPIC_API_KEY
OPENAI_API_KEY
GOOGLE_GENAI_API_KEY
XAI_API_KEY
MANUS_API_KEY

# Ingestion
FMTC_API_KEY
INNGEST_EVENT_KEY
INNGEST_SIGNING_KEY
VAULT_ENCRYPTION_KEY

# Email
RESEND_API_KEY

# Analytics
GA4_MEASUREMENT_ID

# Monitoring
SENTRY_DSN
LOGTAIL_TOKEN
```

---

## Appendix B — Glossary

- **FMTC** — Affiliate datafeed aggregator providing normalized merchant/coupon data across networks
- **S2S Postback** — Server-to-server conversion notification for accurate attribution without browser cookies
- **Sub-ID** — Tracking parameter passed through affiliate links to identify originating click/campaign
- **ISR** — Incremental Static Regeneration, Next.js feature to rebuild static pages on a schedule
- **EPC** — Earnings Per Click, affiliate metric used to prioritize merchants/networks
- **DSP** — Demand-Side Platform, programmatic ad-buying platform
- **ADR** — Architecture Decision Record, short doc justifying a stack or design choice
- **Inngest** — Managed background-job platform with cron, retries, and event-driven workflows
- **Drizzle** — Lightweight, type-safe TypeScript ORM for Postgres
- **RLS** — Row Level Security, Postgres feature for row-based access control
- **CLS** — Cumulative Layout Shift, Core Web Vitals metric
- **LCP** — Largest Contentful Paint, Core Web Vitals metric
- **INP** — Interaction to Next Paint, Core Web Vitals metric
- **TTFB** — Time to First Byte, server response speed metric
- **Path C** — The hybrid architecture strategy chosen for this rebuild (new Next.js frontend + preserved legacy admin)

---

**End of PRD v3**
