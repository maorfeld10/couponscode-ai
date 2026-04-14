# Week 1 — Monorepo Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the `couponscode-ai` monorepo with the existing Vite admin relocated into `apps/admin-legacy/` and still functional, all new packages and apps scaffolded with passing typecheck, and all DB migrations written and verified against a staging Supabase database.

**Architecture:** pnpm workspaces monorepo with three apps (`web`, `ingestion`, `admin-legacy`) and four shared packages (`contracts`, `db`, `llm`, `ui`). The existing Vite/Express admin is copied into `apps/admin-legacy/` unchanged and continues to read/write the existing Supabase database. The new apps and packages are scaffolded empty but typecheck cleanly. All DB schema changes are strictly additive (new columns, new tables, new RLS policies) — no destructive migrations.

**Tech Stack:** pnpm 9+, Node 20+, TypeScript 5.8 strict, Next.js 14, Drizzle ORM, Supabase (existing), Inngest, Tailwind 4, React 19.

---

## Prerequisites

Before starting, the user must have completed:

1. **pnpm installed globally:** `npm install -g pnpm` (version 9 or higher)
2. **Node 20+** installed (verify: `node --version`)
3. **Git** installed and configured with `user.name` and `user.email`
4. **Supabase staging database created** — a *separate* Supabase project to test migrations against before touching production. This is non-negotiable: migrations are never applied to production in this plan.
5. **Supabase staging credentials** in hand: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `DATABASE_URL` (the Postgres connection string)
6. **Existing project dump** — a snapshot of the current production Supabase data loaded into the staging project so migrations run against realistic data

**Do not proceed if any prerequisite is missing.** Ask the user to resolve each before starting Task 1.

---

## File Structure

```
couponscode-ai/                              ← NEW directory, sibling to existing "Coupon site - 1.1"
├── apps/
│   ├── web/                                 ← NEW: Next.js 14 (scaffold only, routes in Week 2)
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                     ← placeholder "Coming Soon"
│   │   │   └── globals.css
│   │   ├── public/
│   │   │   └── favicon.ico
│   │   ├── next.config.mjs
│   │   ├── tailwind.config.ts
│   │   ├── postcss.config.mjs
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── .env.example
│   ├── ingestion/                           ← NEW: Node + Inngest (scaffold only, adapters in Week 3)
│   │   ├── src/
│   │   │   ├── index.ts                     ← placeholder export
│   │   │   └── inngest.ts                   ← Inngest client
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── .env.example
│   └── admin-legacy/                        ← COPIED from existing "Coupon site - 1.1"
│       ├── src/                             ← existing src/ contents
│       ├── public/
│       ├── scripts/
│       ├── supabase/
│       ├── server.ts
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── package.json                     ← renamed "admin-legacy"
│       ├── index.html
│       ├── vercel.json
│       ├── metadata.json
│       └── .env.example
├── packages/
│   ├── contracts/                           ← NEW: Drizzle schema + types + Zod + events
│   │   ├── src/
│   │   │   ├── index.ts                     ← barrel export
│   │   │   ├── schema.ts                    ← Drizzle table definitions (stub now, populated via migrations)
│   │   │   ├── types.ts                     ← RawMerchant, RawCoupon, HealthStatus
│   │   │   ├── zod.ts                       ← Zod schemas for API input validation
│   │   │   └── events.ts                    ← Inngest event names + payloads
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── db/                                  ← NEW: Drizzle client + migration runner
│   │   ├── src/
│   │   │   ├── client.ts                    ← Drizzle instance + pg connection
│   │   │   └── migrate.ts                   ← migration runner CLI
│   │   ├── drizzle/                         ← migration SQL files
│   │   │   ├── 0000_baseline.sql            ← introspection baseline (from existing DB)
│   │   │   ├── 0001_add_merchant_coupon_columns.sql
│   │   │   ├── 0001_add_merchant_coupon_columns.down.sql
│   │   │   ├── 0002_create_networks_tables.sql
│   │   │   ├── 0002_create_networks_tables.down.sql
│   │   │   ├── 0003_create_llm_providers.sql
│   │   │   ├── 0003_create_llm_providers.down.sql
│   │   │   ├── 0004_create_content_tables.sql
│   │   │   ├── 0004_create_content_tables.down.sql
│   │   │   ├── 0005_create_tracking_tables.sql
│   │   │   ├── 0005_create_tracking_tables.down.sql
│   │   │   ├── 0006_rls_policies.sql
│   │   │   └── 0006_rls_policies.down.sql
│   │   ├── drizzle.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── llm/                                 ← NEW: Multi-provider LLM registry (scaffold only)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── types.ts                     ← LLMAdapter, GenerateOpts, LLMResult
│   │   │   ├── router.ts                    ← stub, real impl in S4
│   │   │   └── adapters/
│   │   │       ├── base.ts
│   │   │       └── index.ts                 ← registry stub
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── ui/                                  ← NEW: shared UI components (empty scaffold)
│       ├── src/
│       │   └── index.ts                     ← barrel export (empty)
│       ├── tsconfig.json
│       └── package.json
├── docs/
│   ├── PRD-v3-couponscode-ai.md             ← copied from existing docs/
│   └── superpowers/
│       ├── specs/
│       │   └── 2026-04-13-couponscode-ai-rebuild-s1-s2-design.md
│       └── plans/
│           └── 2026-04-13-week1-monorepo-foundation.md  ← this file
├── .github/
│   └── workflows/
│       └── ci.yml                           ← typecheck + lint across all packages
├── .gitignore
├── .editorconfig
├── .nvmrc                                   ← "20"
├── pnpm-workspace.yaml
├── package.json                             ← root workspace config
├── tsconfig.base.json                       ← extended by each app/package
├── CLAUDE.md                                ← renamed from lowercase claude.md
├── README.md
└── LICENSE                                  ← MIT or proprietary, user choice
```

---

## Task 1: Pre-flight Environment Check

**Files:** none (verification only)

**Purpose:** Ensure the dev environment is ready before we start creating files.

- [ ] **Step 1: Check Node version**

Run: `node --version`
Expected: `v20.x.x` or higher (e.g., `v20.11.1`)
If lower: stop and ask user to install Node 20+.

- [ ] **Step 2: Check pnpm installed**

Run: `pnpm --version`
Expected: `9.x.x` or higher
If not installed: stop and run `npm install -g pnpm`, then re-check.

- [ ] **Step 3: Check git configured**

Run: `git config user.name && git config user.email`
Expected: two non-empty lines
If empty: stop and ask user to configure.

- [ ] **Step 4: Check existing admin still builds in current location**

Run from `"c:/Users/Maor Feldman/Documents/Claude/Projects/Coupon site - 1.1"`:
```bash
npm install
npm run lint
```
Expected: `tsc --noEmit` passes with no errors.
If it fails: stop and fix before proceeding. We need a known-good baseline.

- [ ] **Step 5: Confirm Supabase staging credentials are available**

Ask the user to confirm they have a staging Supabase project with a DB dump from production. This is a human gate — do not proceed without explicit confirmation.

Expected output: user says "yes, staging ready" and provides `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` values.

---

## Task 2: Create Monorepo Root Directory

**Files:**
- Create: `c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai/` (empty directory)

**Purpose:** Create the new monorepo root as a sibling to the existing project directory. The existing `Coupon site - 1.1` folder stays untouched as a reference archive.

- [ ] **Step 1: Create the new directory**

Run:
```bash
mkdir -p "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai"
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai"
```

- [ ] **Step 2: Initialize git**

Run:
```bash
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai"
git init
git branch -M main
```
Expected: `Initialized empty Git repository`

- [ ] **Step 3: Commit an empty README placeholder**

Run:
```bash
echo "# couponscode-ai" > README.md
git add README.md
git commit -m "chore: initialize monorepo"
```
Expected: a single commit on main.

---

## Task 3: Create Root Configuration Files

**Files:**
- Create: `couponscode-ai/package.json`
- Create: `couponscode-ai/pnpm-workspace.yaml`
- Create: `couponscode-ai/tsconfig.base.json`
- Create: `couponscode-ai/.gitignore`
- Create: `couponscode-ai/.editorconfig`
- Create: `couponscode-ai/.nvmrc`

**Purpose:** Set up the pnpm workspace root with strict TypeScript configuration that all apps and packages extend.

- [ ] **Step 1: Create `package.json`**

Write to `couponscode-ai/package.json`:
```json
{
  "name": "couponscode-ai",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "scripts": {
    "typecheck": "pnpm -r typecheck",
    "lint": "pnpm -r lint",
    "build": "pnpm -r build",
    "dev": "pnpm -r --parallel dev"
  },
  "devDependencies": {
    "typescript": "~5.8.2"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  }
}
```

- [ ] **Step 2: Create `pnpm-workspace.yaml`**

Write to `couponscode-ai/pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 3: Create `tsconfig.base.json`**

Write to `couponscode-ai/tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "allowJs": false,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 4: Create `.gitignore`**

Write to `couponscode-ai/.gitignore`:
```
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
.next/
out/
.turbo/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local
*.local

# IDE
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea/
*.swp

# OS
.DS_Store
Thumbs.db
desktop.ini

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Testing
coverage/
.nyc_output/

# Drizzle
drizzle/meta/

# Vercel
.vercel
```

- [ ] **Step 5: Create `.editorconfig`**

Write to `couponscode-ai/.editorconfig`:
```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 6: Create `.nvmrc`**

Write to `couponscode-ai/.nvmrc`:
```
20
```

- [ ] **Step 7: Install workspace root dependencies**

Run:
```bash
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai"
pnpm install
```
Expected: creates `pnpm-lock.yaml` and `node_modules/`, installs `typescript`. Zero errors.

- [ ] **Step 8: Commit**

Run:
```bash
git add .
git commit -m "chore: add pnpm workspace root config"
```

---

## Task 4: Copy Existing Vite Admin Into `apps/admin-legacy/`

**Files:**
- Create directory: `couponscode-ai/apps/admin-legacy/`
- Copy: all files from `Coupon site - 1.1/` except `docs/`, `code-review/`, `.git/`, `node_modules/`

**Purpose:** Relocate the existing codebase into the monorepo under `apps/admin-legacy/`. We copy (not move) to preserve the original as a reference archive. The copied files will have their `package.json` renamed in Task 5.

- [ ] **Step 1: Create the target directory**

Run:
```bash
mkdir -p "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai/apps/admin-legacy"
```

- [ ] **Step 2: Copy existing files (excluding docs, code-review, .git, node_modules, package-lock.json)**

Run (from Bash on Windows):
```bash
SRC="c:/Users/Maor Feldman/Documents/Claude/Projects/Coupon site - 1.1"
DST="c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai/apps/admin-legacy"
cp -r "$SRC/src" "$DST/src"
cp -r "$SRC/public" "$DST/public"
cp -r "$SRC/scripts" "$DST/scripts"
cp -r "$SRC/supabase" "$DST/supabase"
cp "$SRC/server.ts" "$DST/server.ts"
cp "$SRC/vite.config.ts" "$DST/vite.config.ts"
cp "$SRC/tsconfig.json" "$DST/tsconfig.json"
cp "$SRC/package.json" "$DST/package.json"
cp "$SRC/index.html" "$DST/index.html"
cp "$SRC/vercel.json" "$DST/vercel.json"
cp "$SRC/metadata.json" "$DST/metadata.json"
cp "$SRC/.env.example" "$DST/.env.example"
cp "$SRC/README.md" "$DST/README.md"
```
Expected: no errors, all files present in destination.

- [ ] **Step 3: Verify copy**

Run:
```bash
ls "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai/apps/admin-legacy"
```
Expected output includes: `src`, `public`, `scripts`, `supabase`, `server.ts`, `vite.config.ts`, `tsconfig.json`, `package.json`, `index.html`, `vercel.json`, `metadata.json`, `.env.example`, `README.md`.

- [ ] **Step 4: Commit the copy (before any modifications)**

Run:
```bash
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai"
git add apps/admin-legacy/
git commit -m "chore: relocate existing Vite admin into apps/admin-legacy"
```

---

## Task 5: Rename `admin-legacy` package and fix path references

**Files:**
- Modify: `couponscode-ai/apps/admin-legacy/package.json`
- Modify: `couponscode-ai/apps/admin-legacy/tsconfig.json` (add `"extends": "../../tsconfig.base.json"`)

**Purpose:** The copied `package.json` still has `"name": "react-example"`. Rename it to `admin-legacy` and extend the base tsconfig so pnpm workspace recognizes it.

- [ ] **Step 1: Rewrite `apps/admin-legacy/package.json`**

Read the current file to preserve all existing scripts and deps, then update the `name` field. Write to `couponscode-ai/apps/admin-legacy/package.json`:
```json
{
  "name": "admin-legacy",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build",
    "start": "tsx server.ts",
    "preview": "vite preview",
    "clean": "rm -rf dist",
    "generate-sitemap": "tsx scripts/generate-sitemap.ts",
    "typecheck": "tsc --noEmit",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^1.29.0",
    "@supabase/supabase-js": "^2.101.0",
    "@tailwindcss/typography": "^0.5.19",
    "@tailwindcss/vite": "^4.1.14",
    "@tiptap/extension-link": "^3.22.2",
    "@tiptap/extension-placeholder": "^3.22.2",
    "@tiptap/extension-underline": "^3.22.2",
    "@tiptap/react": "^3.22.2",
    "@tiptap/starter-kit": "^3.22.2",
    "@types/dompurify": "^3.0.5",
    "@types/papaparse": "^5.5.2",
    "@vitejs/plugin-react": "^5.0.4",
    "docx": "^9.6.1",
    "dompurify": "^3.3.3",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "papaparse": "^5.5.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-helmet-async": "^3.0.0",
    "react-markdown": "^10.1.0",
    "react-router-dom": "^7.13.2",
    "vite": "^6.2.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "autoprefixer": "^10.4.21",
    "tailwindcss": "^4.1.14",
    "tsx": "^4.21.0"
  }
}
```
(Key change: `"name": "admin-legacy"`, dropped duplicate `vite` from devDeps since it's in deps, removed `typescript` from devDeps since it's in workspace root.)

- [ ] **Step 2: Leave `tsconfig.json` unchanged for now**

The existing `tsconfig.json` uses Vite conventions. Do **not** extend `tsconfig.base.json` yet — it would conflict with Vite's strict mode expectations. The admin-legacy package keeps its own isolated TypeScript config. Verify no change needed:

Run:
```bash
cat "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai/apps/admin-legacy/tsconfig.json"
```
Expected: the file exists and references Vite/React config.

- [ ] **Step 3: Install dependencies via pnpm workspace**

Run:
```bash
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai"
pnpm install
```
Expected: pnpm resolves the `admin-legacy` package and installs its dependencies. No errors. `apps/admin-legacy/node_modules/` is created (via symlinks to root).

- [ ] **Step 4: Run typecheck on admin-legacy**

Run:
```bash
pnpm --filter admin-legacy typecheck
```
Expected: `tsc --noEmit` exits cleanly (0 errors). Same behavior as before the move.
If errors: fix path-related issues only. Do not modify unrelated code.

- [ ] **Step 5: Verify admin-legacy can start its dev server**

Run:
```bash
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai"
pnpm --filter admin-legacy dev
```
Expected: Express server starts on the configured port (check existing `server.ts` for port), prints startup log. Press `Ctrl+C` to stop.

**Note:** if this step fails due to `.env` missing, that's OK — the server may refuse to boot without Supabase env vars. That's expected and is not a regression. The test here is that the build system works, not that the app connects to a DB (we'll do that later).

- [ ] **Step 6: Commit**

Run:
```bash
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai"
git add apps/admin-legacy/package.json
git commit -m "chore: rename admin-legacy package, integrate with pnpm workspace"
```

---

## Task 6: Scaffold `packages/contracts`

**Files:**
- Create: `couponscode-ai/packages/contracts/package.json`
- Create: `couponscode-ai/packages/contracts/tsconfig.json`
- Create: `couponscode-ai/packages/contracts/src/index.ts`
- Create: `couponscode-ai/packages/contracts/src/types.ts`
- Create: `couponscode-ai/packages/contracts/src/events.ts`
- Create: `couponscode-ai/packages/contracts/src/zod.ts`
- Create: `couponscode-ai/packages/contracts/src/schema.ts` (empty stub, populated by Drizzle introspect later)

**Purpose:** Create the single source of truth for data shapes that cross subsystem boundaries. Empty scaffold now; real Drizzle schema added in Task 13 after introspection.

- [ ] **Step 1: Create `packages/contracts/package.json`**

Write to `couponscode-ai/packages/contracts/package.json`:
```json
{
  "name": "@couponscode/contracts",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./schema": "./src/schema.ts",
    "./types": "./src/types.ts",
    "./events": "./src/events.ts",
    "./zod": "./src/zod.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "drizzle-orm": "^0.36.0",
    "zod": "^3.23.0"
  }
}
```

- [ ] **Step 2: Create `packages/contracts/tsconfig.json`**

Write to `couponscode-ai/packages/contracts/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "noEmit": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create `packages/contracts/src/types.ts`**

Write to `couponscode-ai/packages/contracts/src/types.ts`:
```ts
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

export interface GenerateOpts {
  role: 'primary' | 'secondary' | 'fallback';
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface LLMResult {
  text: string;
  model: string;
  provider: string;
  tokensUsed: number;
  latencyMs: number;
}
```

- [ ] **Step 4: Create `packages/contracts/src/events.ts`**

Write to `couponscode-ai/packages/contracts/src/events.ts`:
```ts
export const Events = {
  IngestionMerchantUpserted: 'ingestion.merchant.upserted',
  IngestionRunCompleted: 'ingestion.run.completed',
  ContentDraftCreated: 'content.draft.created',
  ContentPublished: 'content.published',
  ClickRecorded: 'click.recorded',
  ConversionReceived: 'conversion.received',
  RefreshCompleted: 'refresh.completed',
} as const;

export type EventName = (typeof Events)[keyof typeof Events];

export interface IngestionMerchantUpsertedPayload {
  merchantId: string;
  isNew: boolean;
}

export interface IngestionRunCompletedPayload {
  runId: string;
  networkKey: string;
  recordsProcessed: number;
  status: 'success' | 'failure';
}

export interface RefreshCompletedPayload {
  runId: string;
  itemsUpdated: number;
}
```

- [ ] **Step 5: Create `packages/contracts/src/zod.ts`**

Write to `couponscode-ai/packages/contracts/src/zod.ts`:
```ts
import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

export const clickRequestSchema = z.object({
  merchantId: z.string().uuid(),
  couponId: z.string().uuid().optional(),
  clickType: z.enum(['show_code', 'get_deal']),
  sessionId: z.string().optional(),
});

export const newsletterSignupSchema = z.object({
  email: z.string().email().max(254),
  source: z.string().max(64).optional(),
});

export type ClickRequest = z.infer<typeof clickRequestSchema>;
export type NewsletterSignup = z.infer<typeof newsletterSignupSchema>;
```

- [ ] **Step 6: Create `packages/contracts/src/schema.ts` (empty stub)**

Write to `couponscode-ai/packages/contracts/src/schema.ts`:
```ts
// Drizzle schema definitions will be populated in Task 13 (introspect existing DB)
// and then extended as migrations are written in Tasks 14-19.
export {};
```

- [ ] **Step 7: Create `packages/contracts/src/index.ts` (barrel export)**

Write to `couponscode-ai/packages/contracts/src/index.ts`:
```ts
export * from './types';
export * from './events';
export * from './zod';
```

- [ ] **Step 8: Install package dependencies**

Run:
```bash
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai"
pnpm install
```
Expected: installs `drizzle-orm` and `zod` under `packages/contracts`.

- [ ] **Step 9: Verify typecheck passes**

Run:
```bash
pnpm --filter @couponscode/contracts typecheck
```
Expected: 0 errors.

- [ ] **Step 10: Commit**

Run:
```bash
git add packages/contracts/
git commit -m "feat(contracts): scaffold shared contracts package with types, events, zod schemas"
```

---

## Task 7: Scaffold `packages/db`

**Files:**
- Create: `couponscode-ai/packages/db/package.json`
- Create: `couponscode-ai/packages/db/tsconfig.json`
- Create: `couponscode-ai/packages/db/drizzle.config.ts`
- Create: `couponscode-ai/packages/db/src/client.ts`
- Create: `couponscode-ai/packages/db/src/migrate.ts`
- Create: `couponscode-ai/packages/db/drizzle/.gitkeep`

**Purpose:** Set up Drizzle client and the migration runner CLI. Actual migrations are written in later tasks.

- [ ] **Step 1: Create `packages/db/package.json`**

Write to `couponscode-ai/packages/db/package.json`:
```json
{
  "name": "@couponscode/db",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/client.ts",
  "types": "./src/client.ts",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "tsc --noEmit",
    "introspect": "drizzle-kit introspect",
    "generate": "drizzle-kit generate",
    "migrate:staging": "tsx src/migrate.ts",
    "studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@couponscode/contracts": "workspace:*",
    "drizzle-orm": "^0.36.0",
    "postgres": "^3.4.5"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "drizzle-kit": "^0.28.0",
    "tsx": "^4.21.0"
  }
}
```

- [ ] **Step 2: Create `packages/db/tsconfig.json`**

Write to `couponscode-ai/packages/db/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "noEmit": true,
    "types": ["node"]
  },
  "include": ["src/**/*", "drizzle.config.ts"],
  "exclude": ["node_modules", "dist", "drizzle"]
}
```

- [ ] **Step 3: Create `packages/db/drizzle.config.ts`**

Write to `couponscode-ai/packages/db/drizzle.config.ts`:
```ts
import type { Config } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL env var required for drizzle-kit commands');
}

export default {
  schema: '../contracts/src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
} satisfies Config;
```

- [ ] **Step 4: Create `packages/db/src/client.ts`**

Write to `couponscode-ai/packages/db/src/client.ts`:
```ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL env var required');
}

const queryClient = postgres(databaseUrl, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(queryClient);
export { queryClient };
```

- [ ] **Step 5: Create `packages/db/src/migrate.ts`**

Write to `couponscode-ai/packages/db/src/migrate.ts`:
```ts
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('ERROR: DATABASE_URL env var required');
  process.exit(1);
}

const direction = process.argv[2];
if (direction !== 'up' && direction !== 'down') {
  console.error('Usage: tsx migrate.ts <up|down> [migration-number]');
  process.exit(1);
}

const specificMigration = process.argv[3];

async function main() {
  const sql = postgres(databaseUrl!, { max: 1 });
  const drizzleDir = join(import.meta.dirname, '..', 'drizzle');
  const files = readdirSync(drizzleDir)
    .filter((f) => f.endsWith(direction === 'up' ? '.sql' : '.down.sql'))
    .filter((f) => direction === 'up' ? !f.endsWith('.down.sql') : true)
    .filter((f) => !specificMigration || f.startsWith(specificMigration))
    .sort((a, b) => (direction === 'up' ? a.localeCompare(b) : b.localeCompare(a)));

  console.log(`Running ${files.length} ${direction} migration(s)...`);

  for (const file of files) {
    const content = readFileSync(join(drizzleDir, file), 'utf-8');
    console.log(`\n▶ ${file}`);
    try {
      await sql.unsafe(content);
      console.log(`  ✓ OK`);
    } catch (err) {
      console.error(`  ✗ FAILED:`, err);
      await sql.end();
      process.exit(1);
    }
  }

  console.log(`\n✓ All migrations applied.`);
  await sql.end();
  process.exit(0);
}

main();
```

- [ ] **Step 6: Create empty `drizzle/` directory placeholder**

Run:
```bash
mkdir -p "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai/packages/db/drizzle"
touch "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai/packages/db/drizzle/.gitkeep"
```

- [ ] **Step 7: Install dependencies**

Run:
```bash
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai"
pnpm install
```
Expected: installs `drizzle-orm`, `drizzle-kit`, `postgres`, `tsx` under `packages/db`.

- [ ] **Step 8: Verify typecheck passes**

Run:
```bash
pnpm --filter @couponscode/db typecheck
```
Expected: 0 errors.

- [ ] **Step 9: Commit**

Run:
```bash
git add packages/db/
git commit -m "feat(db): scaffold Drizzle client and migration runner"
```

---

## Task 8: Scaffold `packages/llm`

**Files:**
- Create: `couponscode-ai/packages/llm/package.json`
- Create: `couponscode-ai/packages/llm/tsconfig.json`
- Create: `couponscode-ai/packages/llm/src/index.ts`
- Create: `couponscode-ai/packages/llm/src/types.ts`
- Create: `couponscode-ai/packages/llm/src/router.ts`
- Create: `couponscode-ai/packages/llm/src/adapters/base.ts`
- Create: `couponscode-ai/packages/llm/src/adapters/index.ts`

**Purpose:** Scaffold the multi-provider LLM registry. Router and adapters are stubs; real implementation happens in Subsystem 4 (Week 6+). But the interface and file layout exist now so other packages can depend on it.

- [ ] **Step 1: Create `packages/llm/package.json`**

Write to `couponscode-ai/packages/llm/package.json`:
```json
{
  "name": "@couponscode/llm",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@couponscode/contracts": "workspace:*"
  }
}
```

- [ ] **Step 2: Create `packages/llm/tsconfig.json`**

Write to `couponscode-ai/packages/llm/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "noEmit": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create `packages/llm/src/types.ts`**

Write to `couponscode-ai/packages/llm/src/types.ts`:
```ts
import type { GenerateOpts, LLMResult } from '@couponscode/contracts';

export type AdapterKey = 'anthropic' | 'openai' | 'google' | 'xai' | 'manus' | 'custom';

export interface LLMProviderConfig {
  id: string;
  name: string;
  adapterKey: AdapterKey;
  model: string;
  role: 'primary' | 'secondary' | 'fallback';
  priority: number;
  isActive: boolean;
  apiKeyRef: string;
  config: Record<string, unknown>;
}

export interface LLMAdapter {
  readonly key: AdapterKey;
  generate(prompt: string, opts: GenerateOpts, config: LLMProviderConfig): Promise<LLMResult>;
}

export type { GenerateOpts, LLMResult };
```

- [ ] **Step 4: Create `packages/llm/src/adapters/base.ts`**

Write to `couponscode-ai/packages/llm/src/adapters/base.ts`:
```ts
import type { LLMAdapter, LLMProviderConfig, AdapterKey } from '../types';
import type { GenerateOpts, LLMResult } from '@couponscode/contracts';

export abstract class BaseLLMAdapter implements LLMAdapter {
  abstract readonly key: AdapterKey;
  abstract generate(
    prompt: string,
    opts: GenerateOpts,
    config: LLMProviderConfig,
  ): Promise<LLMResult>;
}
```

- [ ] **Step 5: Create `packages/llm/src/adapters/index.ts` (registry stub)**

Write to `couponscode-ai/packages/llm/src/adapters/index.ts`:
```ts
import type { LLMAdapter, AdapterKey } from '../types';

// Real adapter implementations (anthropic, openai, google, xai, manus, custom)
// are added in Subsystem 4. This registry is a placeholder.
export const adapterRegistry: Partial<Record<AdapterKey, LLMAdapter>> = {};

export function registerAdapter(adapter: LLMAdapter): void {
  adapterRegistry[adapter.key] = adapter;
}

export function getAdapter(key: AdapterKey): LLMAdapter | undefined {
  return adapterRegistry[key];
}
```

- [ ] **Step 6: Create `packages/llm/src/router.ts` (stub)**

Write to `couponscode-ai/packages/llm/src/router.ts`:
```ts
import type { GenerateOpts, LLMResult } from '@couponscode/contracts';
import type { LLMProviderConfig } from './types';
import { getAdapter } from './adapters';

export async function route(
  prompt: string,
  opts: GenerateOpts,
  providers: LLMProviderConfig[],
): Promise<LLMResult> {
  const candidates = providers
    .filter((p) => p.isActive && p.role === opts.role)
    .sort((a, b) => a.priority - b.priority);

  if (candidates.length === 0) {
    throw new Error(`No active LLM providers for role: ${opts.role}`);
  }

  let lastError: unknown;
  for (const provider of candidates) {
    const adapter = getAdapter(provider.adapterKey);
    if (!adapter) {
      lastError = new Error(`No adapter registered for: ${provider.adapterKey}`);
      continue;
    }
    try {
      return await adapter.generate(prompt, opts, provider);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError ?? new Error('All LLM providers failed');
}
```

- [ ] **Step 7: Create `packages/llm/src/index.ts` (barrel export)**

Write to `couponscode-ai/packages/llm/src/index.ts`:
```ts
export * from './types';
export * from './router';
export { registerAdapter, getAdapter } from './adapters';
export { BaseLLMAdapter } from './adapters/base';
```

- [ ] **Step 8: Install and typecheck**

Run:
```bash
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai"
pnpm install
pnpm --filter @couponscode/llm typecheck
```
Expected: 0 errors.

- [ ] **Step 9: Commit**

Run:
```bash
git add packages/llm/
git commit -m "feat(llm): scaffold multi-provider LLM registry with router stub"
```

---

## Task 9: Scaffold `packages/ui`

**Files:**
- Create: `couponscode-ai/packages/ui/package.json`
- Create: `couponscode-ai/packages/ui/tsconfig.json`
- Create: `couponscode-ai/packages/ui/src/index.ts`

**Purpose:** Empty shared-UI package scaffold. Real components land in Week 2 as they become needed.

- [ ] **Step 1: Create `packages/ui/package.json`**

Write to `couponscode-ai/packages/ui/package.json`:
```json
{
  "name": "@couponscode/ui",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.2.14"
  },
  "peerDependencies": {
    "react": "^19.0.0"
  }
}
```

- [ ] **Step 2: Create `packages/ui/tsconfig.json`**

Write to `couponscode-ai/packages/ui/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create `packages/ui/src/index.ts`**

Write to `couponscode-ai/packages/ui/src/index.ts`:
```ts
// Shared UI components will be added here as needed in Week 2+.
export {};
```

- [ ] **Step 4: Install and typecheck**

Run:
```bash
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai"
pnpm install
pnpm --filter @couponscode/ui typecheck
```
Expected: 0 errors.

- [ ] **Step 5: Commit**

Run:
```bash
git add packages/ui/
git commit -m "feat(ui): scaffold shared UI package"
```

---

## Task 10: Scaffold `apps/web` (Next.js 14 placeholder)

**Files:**
- Create: `couponscode-ai/apps/web/package.json`
- Create: `couponscode-ai/apps/web/tsconfig.json`
- Create: `couponscode-ai/apps/web/next.config.mjs`
- Create: `couponscode-ai/apps/web/tailwind.config.ts`
- Create: `couponscode-ai/apps/web/postcss.config.mjs`
- Create: `couponscode-ai/apps/web/app/layout.tsx`
- Create: `couponscode-ai/apps/web/app/page.tsx`
- Create: `couponscode-ai/apps/web/app/globals.css`
- Create: `couponscode-ai/apps/web/.env.example`

**Purpose:** Scaffold a minimal Next.js 14 App Router project that typechecks, builds, and serves a placeholder homepage. Real routes land in Week 2.

- [ ] **Step 1: Create `apps/web/package.json`**

Write to `couponscode-ai/apps/web/package.json`:
```json
{
  "name": "@couponscode/web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "next lint"
  },
  "dependencies": {
    "@couponscode/contracts": "workspace:*",
    "@couponscode/db": "workspace:*",
    "@couponscode/llm": "workspace:*",
    "@couponscode/ui": "workspace:*",
    "next": "^14.2.18",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.0.0",
    "eslint-config-next": "^14.2.18",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0"
  }
}
```
**Note:** Next.js 14 ships best with Tailwind 3. Tailwind 4 in admin-legacy stays there; web uses Tailwind 3. React 19 is compatible with Next.js 14.2.18+.

- [ ] **Step 2: Create `apps/web/tsconfig.json`**

Write to `couponscode-ai/apps/web/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "noEmit": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      { "name": "next" }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `apps/web/next.config.mjs`**

Write to `couponscode-ai/apps/web/next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  transpilePackages: [
    '@couponscode/contracts',
    '@couponscode/db',
    '@couponscode/llm',
    '@couponscode/ui',
  ],
};

export default nextConfig;
```

- [ ] **Step 4: Create `apps/web/tailwind.config.ts`**

Write to `couponscode-ai/apps/web/tailwind.config.ts`:
```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0F172A',
          accent: '#F59E0B',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 5: Create `apps/web/postcss.config.mjs`**

Write to `couponscode-ai/apps/web/postcss.config.mjs`:
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: Create `apps/web/app/globals.css`**

Write to `couponscode-ai/apps/web/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

html {
  font-family: var(--font-sans);
}
```

- [ ] **Step 7: Create `apps/web/app/layout.tsx`**

Write to `couponscode-ai/apps/web/app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'couponscode.ai',
  description: 'Verified coupons, promo codes, and deals from your favorite brands.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: Create `apps/web/app/page.tsx` (placeholder)**

Write to `couponscode-ai/apps/web/app/page.tsx`:
```tsx
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">couponscode.ai</h1>
      <p className="mt-4 text-lg text-slate-600">Coming soon — Week 2 build in progress.</p>
    </main>
  );
}
```

- [ ] **Step 9: Create `apps/web/.env.example`**

Write to `couponscode-ai/apps/web/.env.example`:
```
# Public
NEXT_PUBLIC_SITE_URL=https://couponscode.ai

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=postgresql://...

# LLM (placeholders; actual keys live in vault later)
ANTHROPIC_API_KEY=
GOOGLE_GENAI_API_KEY=

# Analytics
GA4_MEASUREMENT_ID=G-403CVLGNPQ

# Monitoring (optional at MVP)
SENTRY_DSN=
```

- [ ] **Step 10: Install deps and verify build**

Run:
```bash
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai"
pnpm install
pnpm --filter @couponscode/web typecheck
```
Expected: 0 errors.

- [ ] **Step 11: Verify Next.js build works**

Run:
```bash
pnpm --filter @couponscode/web build
```
Expected: Next.js build completes with `Compiled successfully`, generates `.next/` directory. No errors.

- [ ] **Step 12: Commit**

Run:
```bash
git add apps/web/
git commit -m "feat(web): scaffold Next.js 14 app with placeholder homepage"
```

---

## Task 11: Scaffold `apps/ingestion`

**Files:**
- Create: `couponscode-ai/apps/ingestion/package.json`
- Create: `couponscode-ai/apps/ingestion/tsconfig.json`
- Create: `couponscode-ai/apps/ingestion/src/index.ts`
- Create: `couponscode-ai/apps/ingestion/src/inngest.ts`
- Create: `couponscode-ai/apps/ingestion/.env.example`

**Purpose:** Scaffold the ingestion service with an Inngest client. Real adapters and jobs arrive in Week 3.

- [ ] **Step 1: Create `apps/ingestion/package.json`**

Write to `couponscode-ai/apps/ingestion/package.json`:
```json
{
  "name": "@couponscode/ingestion",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@couponscode/contracts": "workspace:*",
    "@couponscode/db": "workspace:*",
    "inngest": "^3.27.0"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "tsx": "^4.21.0"
  }
}
```

- [ ] **Step 2: Create `apps/ingestion/tsconfig.json`**

Write to `couponscode-ai/apps/ingestion/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "noEmit": false,
    "types": ["node"],
    "module": "ESNext",
    "moduleResolution": "Bundler"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create `apps/ingestion/src/inngest.ts`**

Write to `couponscode-ai/apps/ingestion/src/inngest.ts`:
```ts
import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'couponscode-ingestion',
  eventKey: process.env.INNGEST_EVENT_KEY,
});
```

- [ ] **Step 4: Create `apps/ingestion/src/index.ts`**

Write to `couponscode-ai/apps/ingestion/src/index.ts`:
```ts
import { inngest } from './inngest';

// Real adapters and scheduled functions land in Week 3.
// This file currently exists so `pnpm --filter @couponscode/ingestion typecheck` passes.

export { inngest };

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('ingestion service scaffold — no jobs registered yet');
}
```

- [ ] **Step 5: Create `apps/ingestion/.env.example`**

Write to `couponscode-ai/apps/ingestion/.env.example`:
```
# Database
DATABASE_URL=postgresql://...

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# FMTC (Week 3)
FMTC_API_KEY=

# Vault
VAULT_ENCRYPTION_KEY=
```

- [ ] **Step 6: Install and typecheck**

Run:
```bash
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai"
pnpm install
pnpm --filter @couponscode/ingestion typecheck
```
Expected: 0 errors.

- [ ] **Step 7: Commit**

Run:
```bash
git add apps/ingestion/
git commit -m "feat(ingestion): scaffold ingestion service with Inngest client"
```

---

## Task 12: Full workspace typecheck

**Files:** none (verification)

**Purpose:** Confirm the entire monorepo typechecks cleanly before we start writing migrations.

- [ ] **Step 1: Run full workspace typecheck**

Run:
```bash
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai"
pnpm typecheck
```
Expected: every package reports 0 errors. Output includes lines like:
```
apps/admin-legacy typecheck: ...
apps/ingestion typecheck: ...
apps/web typecheck: ...
packages/contracts typecheck: ...
packages/db typecheck: ...
packages/llm typecheck: ...
packages/ui typecheck: ...
Scope: 7 of 7 workspace projects
```

If any package fails, stop and fix before proceeding. Every package must be green before we touch the DB.

- [ ] **Step 2: Commit (clean checkpoint)**

Only runs if typecheck passed. If no changes since last commit, this step is a no-op.

Run:
```bash
git status
```
Expected: `nothing to commit, working tree clean`.

---

## Task 13: Drizzle introspection baseline (migration 0000)

**Files:**
- Create: `couponscode-ai/packages/db/drizzle/0000_baseline.sql` (generated by drizzle-kit)
- Modify: `couponscode-ai/packages/contracts/src/schema.ts` (generated by drizzle-kit)

**Purpose:** Point Drizzle at the staging Supabase database and introspect the existing schema to generate baseline TypeScript types. This gives us the current state of the DB as a starting point for migrations.

**⚠️ Human gate:** this step reads from the staging Supabase. The user must provide the staging `DATABASE_URL` and confirm before running.

- [ ] **Step 1: Ask user for staging DATABASE_URL**

Prompt the user:
> "Provide the staging Supabase `DATABASE_URL` (Postgres connection string). This will be used to introspect the schema. The URL is read-only for this step — no writes. If you don't have one yet, stop and set up a staging Supabase project first."

Wait for the user's response. Store the URL in a shell env var locally (do NOT commit it).

- [ ] **Step 2: Write `.env.local` for the db package (gitignored)**

Create `couponscode-ai/packages/db/.env.local`:
```
DATABASE_URL=<paste from user>
```

Verify `.env.local` is gitignored by checking `.gitignore` — it should match `*.local`.

- [ ] **Step 3: Run drizzle-kit introspect**

Run:
```bash
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai/packages/db"
set -a && source .env.local && set +a
pnpm introspect
```
Expected:
- `drizzle-kit` connects to the staging DB
- Generates `packages/db/drizzle/0000_<hash>_<name>.sql` with the current schema
- Generates TypeScript schema types
- Exits cleanly

**If it fails** (connection error, auth error, etc.): stop and verify the DATABASE_URL with the user. Do not proceed.

- [ ] **Step 4: Rename and move the generated baseline**

The generated file has a Drizzle-assigned hash. Rename it to `0000_baseline.sql`:
```bash
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai/packages/db/drizzle"
ls *.sql
# Identify the generated file (should be the only .sql file)
mv <generated-file>.sql 0000_baseline.sql
```

- [ ] **Step 5: Copy the generated schema types into `packages/contracts/src/schema.ts`**

Read the file that drizzle-kit generated (typically `packages/db/drizzle/schema.ts` or similar). Copy its contents into `packages/contracts/src/schema.ts`, prepending this comment:
```ts
// Generated from drizzle-kit introspect against staging Supabase.
// DO NOT edit by hand — changes should go through new migrations.

// <paste generated content>
```

- [ ] **Step 6: Verify typecheck still passes**

Run:
```bash
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai"
pnpm typecheck
```
Expected: 0 errors. If errors from the generated schema types: fix imports or adjust `drizzle-orm` version.

- [ ] **Step 7: Commit the baseline**

Run:
```bash
git add packages/db/drizzle/0000_baseline.sql packages/contracts/src/schema.ts
git commit -m "feat(db): introspect existing Supabase schema as baseline (migration 0000)"
```

---

## Task 14: Migration 0001 — Additive columns on `merchants` and `coupons`

**Files:**
- Create: `couponscode-ai/packages/db/drizzle/0001_add_merchant_coupon_columns.sql`
- Create: `couponscode-ai/packages/db/drizzle/0001_add_merchant_coupon_columns.down.sql`

**Purpose:** Add columns required for multi-network ingestion, manual overrides, and SEO freshness. All changes are additive — existing rows get defaults automatically.

- [ ] **Step 1: Write migration 0001 (up)**

Write to `couponscode-ai/packages/db/drizzle/0001_add_merchant_coupon_columns.sql`:
```sql
-- Migration 0001: Add columns to merchants and coupons for multi-network ingestion
-- This migration is strictly additive. Existing rows are populated with defaults.

BEGIN;

-- merchants: new columns
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS domain text;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS primary_network_id uuid;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS manual_override_fields jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS last_updated timestamptz NOT NULL DEFAULT NOW();
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS priority_score integer NOT NULL DEFAULT 0;

-- merchants: indexes
CREATE INDEX IF NOT EXISTS idx_merchants_domain ON merchants(lower(domain)) WHERE domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_merchants_priority_score ON merchants(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_merchants_last_updated ON merchants(last_updated DESC);

-- coupons: new columns
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS source_network text;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS last_seen_at timestamptz NOT NULL DEFAULT NOW();
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS manual_override boolean NOT NULL DEFAULT false;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS dedupe_hash text;

-- coupons: unique index on dedupe_hash (partial, since existing rows may be null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_dedupe_hash ON coupons(dedupe_hash) WHERE dedupe_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_coupons_source_network ON coupons(source_network) WHERE source_network IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_coupons_last_seen_at ON coupons(last_seen_at DESC);

COMMIT;
```

- [ ] **Step 2: Write migration 0001 (down)**

Write to `couponscode-ai/packages/db/drizzle/0001_add_merchant_coupon_columns.down.sql`:
```sql
-- Rollback migration 0001: Remove columns added to merchants and coupons
-- WARNING: This will drop the manual_override_fields data. Back up first.

BEGIN;

DROP INDEX IF EXISTS idx_coupons_last_seen_at;
DROP INDEX IF EXISTS idx_coupons_source_network;
DROP INDEX IF EXISTS idx_coupons_dedupe_hash;

ALTER TABLE coupons DROP COLUMN IF EXISTS dedupe_hash;
ALTER TABLE coupons DROP COLUMN IF EXISTS manual_override;
ALTER TABLE coupons DROP COLUMN IF EXISTS last_seen_at;
ALTER TABLE coupons DROP COLUMN IF EXISTS external_id;
ALTER TABLE coupons DROP COLUMN IF EXISTS source_network;

DROP INDEX IF EXISTS idx_merchants_last_updated;
DROP INDEX IF EXISTS idx_merchants_priority_score;
DROP INDEX IF EXISTS idx_merchants_domain;

ALTER TABLE merchants DROP COLUMN IF EXISTS priority_score;
ALTER TABLE merchants DROP COLUMN IF EXISTS last_updated;
ALTER TABLE merchants DROP COLUMN IF EXISTS manual_override_fields;
ALTER TABLE merchants DROP COLUMN IF EXISTS primary_network_id;
ALTER TABLE merchants DROP COLUMN IF EXISTS domain;

COMMIT;
```

- [ ] **Step 3: Commit the migration files**

Run:
```bash
git add packages/db/drizzle/0001_*.sql
git commit -m "feat(db): migration 0001 — additive columns on merchants and coupons"
```

---

## Task 15: Migration 0002 — `networks`, `network_credentials`, `ingestion_runs`, `refresh_runs`

**Files:**
- Create: `couponscode-ai/packages/db/drizzle/0002_create_networks_tables.sql`
- Create: `couponscode-ai/packages/db/drizzle/0002_create_networks_tables.down.sql`

**Purpose:** Create infrastructure tables for the ingestion pipeline.

- [ ] **Step 1: Write migration 0002 (up)**

Write to `couponscode-ai/packages/db/drizzle/0002_create_networks_tables.sql`:
```sql
-- Migration 0002: Create networks, network_credentials, ingestion_runs, refresh_runs

BEGIN;

CREATE TABLE IF NOT EXISTS networks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  adapter_key text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  last_sync_at timestamptz,
  status text NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'degraded', 'down')),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_networks_adapter_key ON networks(adapter_key);
CREATE INDEX IF NOT EXISTS idx_networks_active ON networks(is_active) WHERE is_active;

-- Now that networks exists, add the FK constraint on merchants.primary_network_id
ALTER TABLE merchants
  ADD CONSTRAINT fk_merchants_primary_network
  FOREIGN KEY (primary_network_id) REFERENCES networks(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS network_credentials (
  network_id uuid PRIMARY KEY REFERENCES networks(id) ON DELETE CASCADE,
  key_vault_ref text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ingestion_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  network_id uuid REFERENCES networks(id) ON DELETE CASCADE,
  job_type text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT NOW(),
  finished_at timestamptz,
  records_processed integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'failure')),
  error text
);

CREATE INDEX IF NOT EXISTS idx_ingestion_runs_network_started ON ingestion_runs(network_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_ingestion_runs_status ON ingestion_runs(status, started_at DESC);

CREATE TABLE IF NOT EXISTS refresh_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at timestamptz NOT NULL DEFAULT NOW(),
  items_updated integer NOT NULL DEFAULT 0,
  duration_ms integer,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'failure')),
  error text
);

CREATE INDEX IF NOT EXISTS idx_refresh_runs_run_at ON refresh_runs(run_at DESC);

COMMIT;
```

- [ ] **Step 2: Write migration 0002 (down)**

Write to `couponscode-ai/packages/db/drizzle/0002_create_networks_tables.down.sql`:
```sql
-- Rollback migration 0002

BEGIN;

DROP INDEX IF EXISTS idx_refresh_runs_run_at;
DROP TABLE IF EXISTS refresh_runs;

DROP INDEX IF EXISTS idx_ingestion_runs_status;
DROP INDEX IF EXISTS idx_ingestion_runs_network_started;
DROP TABLE IF EXISTS ingestion_runs;

DROP TABLE IF EXISTS network_credentials;

ALTER TABLE merchants DROP CONSTRAINT IF EXISTS fk_merchants_primary_network;

DROP INDEX IF EXISTS idx_networks_active;
DROP INDEX IF EXISTS idx_networks_adapter_key;
DROP TABLE IF EXISTS networks;

COMMIT;
```

- [ ] **Step 3: Commit**

Run:
```bash
git add packages/db/drizzle/0002_*.sql
git commit -m "feat(db): migration 0002 — networks, credentials, ingestion_runs, refresh_runs"
```

---

## Task 16: Migration 0003 — `llm_providers`

**Files:**
- Create: `couponscode-ai/packages/db/drizzle/0003_create_llm_providers.sql`
- Create: `couponscode-ai/packages/db/drizzle/0003_create_llm_providers.down.sql`

**Purpose:** Create the multi-provider LLM registry table.

- [ ] **Step 1: Write migration 0003 (up)**

Write to `couponscode-ai/packages/db/drizzle/0003_create_llm_providers.sql`:
```sql
-- Migration 0003: Create llm_providers multi-provider registry

BEGIN;

CREATE TABLE IF NOT EXISTS llm_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  adapter_key text NOT NULL CHECK (adapter_key IN ('anthropic', 'openai', 'google', 'xai', 'manus', 'custom')),
  model text NOT NULL,
  role text NOT NULL CHECK (role IN ('primary', 'secondary', 'fallback')),
  priority integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  api_key_ref text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_used_at timestamptz,
  success_count integer NOT NULL DEFAULT 0,
  failure_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_llm_providers_role_priority
  ON llm_providers(role, priority)
  WHERE is_active;

COMMIT;
```

- [ ] **Step 2: Write migration 0003 (down)**

Write to `couponscode-ai/packages/db/drizzle/0003_create_llm_providers.down.sql`:
```sql
-- Rollback migration 0003

BEGIN;

DROP INDEX IF EXISTS idx_llm_providers_role_priority;
DROP TABLE IF EXISTS llm_providers;

COMMIT;
```

- [ ] **Step 3: Commit**

Run:
```bash
git add packages/db/drizzle/0003_*.sql
git commit -m "feat(db): migration 0003 — llm_providers multi-provider registry"
```

---

## Task 17: Migration 0004 — `content_drafts`, `content_published`, `topic_queue`

**Files:**
- Create: `couponscode-ai/packages/db/drizzle/0004_create_content_tables.sql`
- Create: `couponscode-ai/packages/db/drizzle/0004_create_content_tables.down.sql`

**Purpose:** Create Subsystem 4 tables now (empty, used later in Week 6+).

- [ ] **Step 1: Write migration 0004 (up)**

Write to `couponscode-ai/packages/db/drizzle/0004_create_content_tables.sql`:
```sql
-- Migration 0004: Create content pipeline tables (Subsystem 4)

BEGIN;

CREATE TABLE IF NOT EXISTS topic_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  source text NOT NULL CHECK (source IN ('trending', 'holiday', 'expiring', 'manual', 'gsc')),
  priority integer NOT NULL DEFAULT 0,
  scheduled_for timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'drafting', 'done', 'skipped')),
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_topic_queue_status_priority ON topic_queue(status, priority DESC, scheduled_for);

CREATE TABLE IF NOT EXISTS content_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('blog', 'about', 'faq', 'guide', 'category_intro')),
  target_id uuid,
  title text,
  body_md text,
  body_html text,
  schema_jsonld jsonb,
  llm_provider text,
  llm_model text,
  prompt_version text,
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'scheduled')),
  feedback text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_drafts_status ON content_drafts(status, created_at DESC);

CREATE TABLE IF NOT EXISTS content_published (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid REFERENCES content_drafts(id) ON DELETE SET NULL,
  type text NOT NULL,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  body_html text NOT NULL,
  schema_jsonld jsonb,
  publish_date timestamptz NOT NULL DEFAULT NOW(),
  last_refreshed_at timestamptz NOT NULL DEFAULT NOW(),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_published_slug ON content_published(slug);
CREATE INDEX IF NOT EXISTS idx_content_published_type_date ON content_published(type, publish_date DESC);

COMMIT;
```

- [ ] **Step 2: Write migration 0004 (down)**

Write to `couponscode-ai/packages/db/drizzle/0004_create_content_tables.down.sql`:
```sql
-- Rollback migration 0004

BEGIN;

DROP INDEX IF EXISTS idx_content_published_type_date;
DROP INDEX IF EXISTS idx_content_published_slug;
DROP TABLE IF EXISTS content_published;

DROP INDEX IF EXISTS idx_content_drafts_status;
DROP TABLE IF EXISTS content_drafts;

DROP INDEX IF EXISTS idx_topic_queue_status_priority;
DROP TABLE IF EXISTS topic_queue;

COMMIT;
```

- [ ] **Step 3: Commit**

Run:
```bash
git add packages/db/drizzle/0004_*.sql
git commit -m "feat(db): migration 0004 — content pipeline tables"
```

---

## Task 18: Migration 0005 — `sessions`, `conversions`

**Files:**
- Create: `couponscode-ai/packages/db/drizzle/0005_create_tracking_tables.sql`
- Create: `couponscode-ai/packages/db/drizzle/0005_create_tracking_tables.down.sql`

**Purpose:** Create Subsystem 5 tables now (empty, used later in Week 8+).

- [ ] **Step 1: Write migration 0005 (up)**

Write to `couponscode-ai/packages/db/drizzle/0005_create_tracking_tables.sql`:
```sql
-- Migration 0005: Create tracking tables (Subsystem 5)

BEGIN;

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cookie_id text NOT NULL UNIQUE,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  gclid text,
  fbclid text,
  first_seen timestamptz NOT NULL DEFAULT NOW(),
  last_seen timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_cookie_id ON sessions(cookie_id);
CREATE INDEX IF NOT EXISTS idx_sessions_utm_source ON sessions(utm_source, first_seen DESC) WHERE utm_source IS NOT NULL;

CREATE TABLE IF NOT EXISTS conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  network_id uuid REFERENCES networks(id) ON DELETE SET NULL,
  sub_id text,
  click_event_id uuid,
  amount numeric(12, 2),
  currency text DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'reversed')),
  raw_payload jsonb,
  received_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversions_network ON conversions(network_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversions_sub_id ON conversions(sub_id) WHERE sub_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversions_status ON conversions(status, received_at DESC);

-- Also extend click_events with session_id if column not present
ALTER TABLE click_events ADD COLUMN IF NOT EXISTS session_id uuid;
CREATE INDEX IF NOT EXISTS idx_click_events_session ON click_events(session_id) WHERE session_id IS NOT NULL;

COMMIT;
```

- [ ] **Step 2: Write migration 0005 (down)**

Write to `couponscode-ai/packages/db/drizzle/0005_create_tracking_tables.down.sql`:
```sql
-- Rollback migration 0005

BEGIN;

DROP INDEX IF EXISTS idx_click_events_session;
ALTER TABLE click_events DROP COLUMN IF EXISTS session_id;

DROP INDEX IF EXISTS idx_conversions_status;
DROP INDEX IF EXISTS idx_conversions_sub_id;
DROP INDEX IF EXISTS idx_conversions_network;
DROP TABLE IF EXISTS conversions;

DROP INDEX IF EXISTS idx_sessions_utm_source;
DROP INDEX IF EXISTS idx_sessions_cookie_id;
DROP TABLE IF EXISTS sessions;

COMMIT;
```

- [ ] **Step 3: Commit**

Run:
```bash
git add packages/db/drizzle/0005_*.sql
git commit -m "feat(db): migration 0005 — tracking tables (sessions, conversions)"
```

---

## Task 19: Migration 0006 — Row Level Security policies

**Files:**
- Create: `couponscode-ai/packages/db/drizzle/0006_rls_policies.sql`
- Create: `couponscode-ai/packages/db/drizzle/0006_rls_policies.down.sql`

**Purpose:** Enable RLS on every sensitive table and create the appropriate policies. This closes the biggest security hole from the v1 code review.

**⚠️ High-stakes migration.** RLS misconfiguration can lock out the admin. This is why we test on staging first (Task 20) and require manual verification.

- [ ] **Step 1: Write migration 0006 (up)**

Write to `couponscode-ai/packages/db/drizzle/0006_rls_policies.sql`:
```sql
-- Migration 0006: Row Level Security policies
--
-- WARNING: This migration restricts access to sensitive tables.
-- Before running, ensure at least one admin exists in admin_users with status='active',
-- and that the service_role key is available as an emergency backdoor.
--
-- The anon role gets read access ONLY to active, visible merchants and their coupons.
-- Admin writes are gated by auth.uid() being in admin_users.

BEGIN;

-- Helper: check if current user is an active admin
CREATE OR REPLACE FUNCTION is_active_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid() AND status = 'active'
  );
$$;

-- merchants: public read only when active + visible
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS merchants_public_select ON merchants;
CREATE POLICY merchants_public_select ON merchants
  FOR SELECT TO anon, authenticated
  USING (is_visible = true AND status = 'active');

DROP POLICY IF EXISTS merchants_admin_all ON merchants;
CREATE POLICY merchants_admin_all ON merchants
  FOR ALL TO authenticated
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

-- coupons: public read only via active merchant
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS coupons_public_select ON coupons;
CREATE POLICY coupons_public_select ON coupons
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM merchants m
    WHERE m.id = coupons.merchant_id
      AND m.is_visible = true
      AND m.status = 'active'
  ));

DROP POLICY IF EXISTS coupons_admin_all ON coupons;
CREATE POLICY coupons_admin_all ON coupons
  FOR ALL TO authenticated
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

-- categories: public read all
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS categories_public_select ON categories;
CREATE POLICY categories_public_select ON categories
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS categories_admin_all ON categories;
CREATE POLICY categories_admin_all ON categories
  FOR ALL TO authenticated
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

-- click_events: public insert only, admin read
ALTER TABLE click_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS click_events_public_insert ON click_events;
CREATE POLICY click_events_public_insert ON click_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS click_events_admin_select ON click_events;
CREATE POLICY click_events_admin_select ON click_events
  FOR SELECT TO authenticated
  USING (is_active_admin());

-- site_users: public insert (newsletter), admin read/update
ALTER TABLE site_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS site_users_public_insert ON site_users;
CREATE POLICY site_users_public_insert ON site_users
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS site_users_admin_all ON site_users;
CREATE POLICY site_users_admin_all ON site_users
  FOR ALL TO authenticated
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

-- merchant_private_data: admin only
ALTER TABLE merchant_private_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS merchant_private_admin_all ON merchant_private_data;
CREATE POLICY merchant_private_admin_all ON merchant_private_data
  FOR ALL TO authenticated
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

-- networks: admin only
ALTER TABLE networks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS networks_admin_all ON networks;
CREATE POLICY networks_admin_all ON networks
  FOR ALL TO authenticated
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

-- network_credentials: admin only
ALTER TABLE network_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS network_credentials_admin_all ON network_credentials;
CREATE POLICY network_credentials_admin_all ON network_credentials
  FOR ALL TO authenticated
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

-- llm_providers: admin only
ALTER TABLE llm_providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS llm_providers_admin_all ON llm_providers;
CREATE POLICY llm_providers_admin_all ON llm_providers
  FOR ALL TO authenticated
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

-- admin_users: self-read for authenticated, all for admins
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_users_self_select ON admin_users;
CREATE POLICY admin_users_self_select ON admin_users
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR is_active_admin());

DROP POLICY IF EXISTS admin_users_admin_all ON admin_users;
CREATE POLICY admin_users_admin_all ON admin_users
  FOR ALL TO authenticated
  USING (is_active_admin())
  WITH CHECK (is_active_admin());

-- audit_logs: immutable, admin read only
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_logs_admin_select ON audit_logs;
CREATE POLICY audit_logs_admin_select ON audit_logs
  FOR SELECT TO authenticated
  USING (is_active_admin());

DROP POLICY IF EXISTS audit_logs_admin_insert ON audit_logs;
CREATE POLICY audit_logs_admin_insert ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (is_active_admin());

-- ingestion_runs, refresh_runs, content_drafts, content_published, topic_queue,
-- sessions, conversions: admin only
ALTER TABLE ingestion_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ingestion_runs_admin_all ON ingestion_runs;
CREATE POLICY ingestion_runs_admin_all ON ingestion_runs
  FOR ALL TO authenticated USING (is_active_admin()) WITH CHECK (is_active_admin());

ALTER TABLE refresh_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS refresh_runs_admin_all ON refresh_runs;
CREATE POLICY refresh_runs_admin_all ON refresh_runs
  FOR ALL TO authenticated USING (is_active_admin()) WITH CHECK (is_active_admin());

ALTER TABLE content_drafts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS content_drafts_admin_all ON content_drafts;
CREATE POLICY content_drafts_admin_all ON content_drafts
  FOR ALL TO authenticated USING (is_active_admin()) WITH CHECK (is_active_admin());

ALTER TABLE content_published ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS content_published_public_select ON content_published;
CREATE POLICY content_published_public_select ON content_published
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS content_published_admin_all ON content_published;
CREATE POLICY content_published_admin_all ON content_published
  FOR ALL TO authenticated USING (is_active_admin()) WITH CHECK (is_active_admin());

ALTER TABLE topic_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS topic_queue_admin_all ON topic_queue;
CREATE POLICY topic_queue_admin_all ON topic_queue
  FOR ALL TO authenticated USING (is_active_admin()) WITH CHECK (is_active_admin());

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sessions_public_insert ON sessions;
CREATE POLICY sessions_public_insert ON sessions
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS sessions_admin_select ON sessions;
CREATE POLICY sessions_admin_select ON sessions
  FOR SELECT TO authenticated USING (is_active_admin());

ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS conversions_admin_all ON conversions;
CREATE POLICY conversions_admin_all ON conversions
  FOR ALL TO authenticated USING (is_active_admin()) WITH CHECK (is_active_admin());

COMMIT;
```

- [ ] **Step 2: Write migration 0006 (down)**

Write to `couponscode-ai/packages/db/drizzle/0006_rls_policies.down.sql`:
```sql
-- Rollback migration 0006: Disable RLS and drop all policies

BEGIN;

ALTER TABLE merchants DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS merchants_public_select ON merchants;
DROP POLICY IF EXISTS merchants_admin_all ON merchants;

ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS coupons_public_select ON coupons;
DROP POLICY IF EXISTS coupons_admin_all ON coupons;

ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS categories_public_select ON categories;
DROP POLICY IF EXISTS categories_admin_all ON categories;

ALTER TABLE click_events DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS click_events_public_insert ON click_events;
DROP POLICY IF EXISTS click_events_admin_select ON click_events;

ALTER TABLE site_users DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS site_users_public_insert ON site_users;
DROP POLICY IF EXISTS site_users_admin_all ON site_users;

ALTER TABLE merchant_private_data DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS merchant_private_admin_all ON merchant_private_data;

ALTER TABLE networks DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS networks_admin_all ON networks;

ALTER TABLE network_credentials DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS network_credentials_admin_all ON network_credentials;

ALTER TABLE llm_providers DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS llm_providers_admin_all ON llm_providers;

ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS admin_users_self_select ON admin_users;
DROP POLICY IF EXISTS admin_users_admin_all ON admin_users;

ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_logs_admin_select ON audit_logs;
DROP POLICY IF EXISTS audit_logs_admin_insert ON audit_logs;

ALTER TABLE ingestion_runs DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ingestion_runs_admin_all ON ingestion_runs;

ALTER TABLE refresh_runs DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS refresh_runs_admin_all ON refresh_runs;

ALTER TABLE content_drafts DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS content_drafts_admin_all ON content_drafts;

ALTER TABLE content_published DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS content_published_public_select ON content_published;
DROP POLICY IF EXISTS content_published_admin_all ON content_published;

ALTER TABLE topic_queue DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS topic_queue_admin_all ON topic_queue;

ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sessions_public_insert ON sessions;
DROP POLICY IF EXISTS sessions_admin_select ON sessions;

ALTER TABLE conversions DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS conversions_admin_all ON conversions;

DROP FUNCTION IF EXISTS is_active_admin();

COMMIT;
```

- [ ] **Step 3: Commit**

Run:
```bash
git add packages/db/drizzle/0006_*.sql
git commit -m "feat(db): migration 0006 — RLS policies on all sensitive tables"
```

---

## Task 20: Apply migrations to staging Supabase (HUMAN GATE)

**Files:** none (execution only)

**Purpose:** Apply all migrations to the staging DB in order, verify they run cleanly, and verify the existing admin still works afterward.

**⚠️ This task touches a real database. Every step requires verification before proceeding.**

- [ ] **Step 1: Confirm staging DATABASE_URL is correctly set**

Run:
```bash
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai/packages/db"
cat .env.local | grep DATABASE_URL
```
Expected: a `DATABASE_URL=postgresql://...` line pointing to the **staging** project (not production).

**If this points at production: STOP. Do not proceed.** Ask the user to create staging first.

- [ ] **Step 2: Take a staging DB snapshot (Supabase backup)**

Go to the Supabase dashboard for the staging project → Database → Backups → Create backup. Wait for confirmation.

Expected: a fresh backup with timestamp matching now. This is the rollback point if any migration breaks things.

- [ ] **Step 3: Apply migration 0001**

Run:
```bash
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai"
set -a && source packages/db/.env.local && set +a
pnpm --filter @couponscode/db migrate:staging up 0001
```
Expected output: `✓ 0001_add_merchant_coupon_columns.sql OK` and `✓ All migrations applied.`

**Verification query** — run via `psql "$DATABASE_URL"` or the Supabase SQL editor:
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'merchants'
  AND column_name IN ('domain', 'primary_network_id', 'manual_override_fields', 'last_updated', 'priority_score');
```
Expected: 5 rows.

- [ ] **Step 4: Apply migration 0002**

Run:
```bash
pnpm --filter @couponscode/db migrate:staging up 0002
```
Expected: `✓ 0002_create_networks_tables.sql OK`.

**Verification query:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('networks', 'network_credentials', 'ingestion_runs', 'refresh_runs');
```
Expected: 4 rows.

- [ ] **Step 5: Apply migration 0003**

Run:
```bash
pnpm --filter @couponscode/db migrate:staging up 0003
```
Expected: `✓ 0003_create_llm_providers.sql OK`.

**Verification:**
```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'llm_providers';
```
Expected: `id, name, adapter_key, model, role, priority, is_active, api_key_ref, config, last_used_at, success_count, failure_count, created_at, updated_at`.

- [ ] **Step 6: Apply migrations 0004 and 0005**

Run:
```bash
pnpm --filter @couponscode/db migrate:staging up 0004
pnpm --filter @couponscode/db migrate:staging up 0005
```
Expected: both successful.

**Verification:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('content_drafts', 'content_published', 'topic_queue', 'sessions', 'conversions');
```
Expected: 5 rows.

- [ ] **Step 7: Apply migration 0006 (RLS policies)**

**⚠️ CRITICAL.** Before running, verify there is at least one active admin user in `admin_users`:
```sql
SELECT id, email, status FROM admin_users WHERE status = 'active';
```
Expected: at least one row. If none: stop and insert one first, otherwise you lock yourself out.

Then run:
```bash
pnpm --filter @couponscode/db migrate:staging up 0006
```
Expected: `✓ 0006_rls_policies.sql OK`.

- [ ] **Step 8: Verify RLS is enforced**

Run via `psql` with the **anon key** (not service_role):
```sql
SET ROLE anon;
SELECT count(*) FROM merchants WHERE is_visible = true AND status = 'active';
-- Should return the public-visible count (not zero if you have active merchants)

SELECT count(*) FROM merchant_private_data;
-- Should return 0 or fail with a policy violation — anon cannot read private data

SELECT count(*) FROM llm_providers;
-- Should return 0 or fail — anon cannot read llm_providers

RESET ROLE;
```
Expected behavior:
- First query returns a normal count
- Second and third queries return 0 (RLS filters out everything)

If second or third query returns non-zero: STOP — RLS is misconfigured. Run the down migration and debug.

- [ ] **Step 9: Verify existing Vite admin still works against staging DB**

Update `apps/admin-legacy/.env.local` to point at staging:
```
VITE_SUPABASE_URL=<staging>
VITE_SUPABASE_ANON_KEY=<staging>
```

Run:
```bash
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai"
pnpm --filter admin-legacy dev
```
Open the admin UI in the browser, log in as the active admin, verify you can:
- List merchants (should show all, including non-visible, because admin RLS policy allows it)
- Open a merchant detail page
- Edit a merchant and save

**If any step fails:** stop and debug. The legacy admin MUST work after migrations. If it doesn't, run all `down` migrations in reverse order to restore staging state.

- [ ] **Step 10: Commit a record of the staging migration run**

Write a file documenting the run:

Create `couponscode-ai/docs/migrations-log.md`:
```md
# Migrations Log

| Date | Environment | Migrations Applied | Verified By |
|---|---|---|---|
| 2026-04-13 | staging | 0001 → 0006 | <user initials> |

## Notes
- All migrations applied cleanly
- RLS verified: anon cannot read merchant_private_data, network_credentials, llm_providers
- Legacy admin verified functional against staging
- Production migration pending user go-ahead
```

Run:
```bash
git add docs/migrations-log.md
git commit -m "docs: log staging migration run (0001-0006)"
```

---

## Task 21: Copy CLAUDE.md, PRD, spec, plan into monorepo

**Files:**
- Copy: `CLAUDE.md` from existing project (rename from lowercase `claude.md`)
- Copy: `docs/PRD-v3-couponscode-ai.md`
- Copy: `docs/superpowers/specs/2026-04-13-couponscode-ai-rebuild-s1-s2-design.md`
- Copy: `docs/superpowers/plans/2026-04-13-week1-monorepo-foundation.md` (this file)

**Purpose:** Move the design documentation into the new monorepo so the repo is self-contained.

- [ ] **Step 1: Copy CLAUDE.md (renamed to uppercase)**

Run:
```bash
SRC="c:/Users/Maor Feldman/Documents/Claude/Projects/Coupon site - 1.1"
DST="c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai"
cp "$SRC/claude.md" "$DST/CLAUDE.md"
```

- [ ] **Step 2: Copy docs/ directory**

Run:
```bash
mkdir -p "$DST/docs/superpowers/specs"
mkdir -p "$DST/docs/superpowers/plans"
cp "$SRC/docs/PRD-v3-couponscode-ai.md" "$DST/docs/"
cp "$SRC/docs/superpowers/specs/2026-04-13-couponscode-ai-rebuild-s1-s2-design.md" "$DST/docs/superpowers/specs/"
cp "$SRC/docs/superpowers/plans/2026-04-13-week1-monorepo-foundation.md" "$DST/docs/superpowers/plans/"
```

- [ ] **Step 3: Write a new README.md**

Replace `couponscode-ai/README.md` with:
```md
# couponscode-ai

Monorepo for couponscode.ai — SEO-first coupon and deals aggregator.

## Structure

- `apps/web` — Next.js 14 public site (SSR/ISR)
- `apps/ingestion` — Node + Inngest affiliate network ingestion service
- `apps/admin-legacy` — Existing Vite/React admin panel (to be migrated in Subsystem 3)
- `packages/contracts` — Shared types, Drizzle schema, Zod validation, Inngest events
- `packages/db` — Drizzle client and migration runner
- `packages/llm` — Multi-provider LLM registry (Claude, OpenAI, Gemini, Grok, Manus, custom)
- `packages/ui` — Shared UI components

## Getting started

Prerequisites: Node 20+, pnpm 9+.

```bash
pnpm install
pnpm typecheck
```

## Documentation

- [PRD v3](docs/PRD-v3-couponscode-ai.md) — product requirements
- [Subsystem 1+2 Design Spec](docs/superpowers/specs/2026-04-13-couponscode-ai-rebuild-s1-s2-design.md)
- [Week 1 Implementation Plan](docs/superpowers/plans/2026-04-13-week1-monorepo-foundation.md)
- [Migrations Log](docs/migrations-log.md)
```

- [ ] **Step 4: Commit**

Run:
```bash
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai"
git add CLAUDE.md docs/ README.md
git commit -m "docs: copy PRD, spec, plan, and CLAUDE.md into monorepo"
```

---

## Task 22: GitHub Actions CI workflow

**Files:**
- Create: `couponscode-ai/.github/workflows/ci.yml`

**Purpose:** Run typecheck + build on every push and PR to catch regressions early.

- [ ] **Step 1: Create the workflow file**

Write to `couponscode-ai/.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  typecheck-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Typecheck all packages
        run: pnpm typecheck

      - name: Build web app
        run: pnpm --filter @couponscode/web build
```

- [ ] **Step 2: Commit**

Run:
```bash
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai"
git add .github/workflows/ci.yml
git commit -m "ci: typecheck and build workflow"
```

---

## Task 23: Connect to GitHub remote and push

**Files:** none (git operations only)

**Purpose:** Push the monorepo to the user's private GitHub repo.

**⚠️ Human gate:** this creates a public-facing artifact (private repo on GitHub). Verify with user before pushing.

- [ ] **Step 1: Ask user to create the empty private GitHub repo**

Prompt the user:
> "Please create an **empty private GitHub repo** named `couponscode-ai` under your account `maorfeld10`:
> 1. Go to https://github.com/new
> 2. Owner: maorfeld10
> 3. Repository name: couponscode-ai
> 4. Visibility: **Private**
> 5. Do **NOT** initialize with README, .gitignore, or license (we already have these locally)
> 6. Click 'Create repository'
> 7. Paste the repo URL back to me (should be `https://github.com/maorfeld10/couponscode-ai.git`)"

Wait for the user's confirmation and the URL.

- [ ] **Step 2: Add the remote**

Run:
```bash
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai"
git remote add origin https://github.com/maorfeld10/couponscode-ai.git
git remote -v
```
Expected: `origin  https://github.com/maorfeld10/couponscode-ai.git (fetch)` and `(push)`.

- [ ] **Step 3: Push main to origin**

Run:
```bash
git push -u origin main
```
Expected: all commits pushed, upstream tracking set.

**If authentication fails:** tell the user to run `gh auth login` or set up a personal access token. Do not store credentials.

- [ ] **Step 4: Verify CI runs on GitHub**

Ask the user to open https://github.com/maorfeld10/couponscode-ai/actions and confirm the CI workflow is running or has completed successfully.

Expected: green checkmark on the first workflow run.

If CI fails: stop and debug. Every push going forward must be green.

---

## Task 24: Final smoke test and handoff

**Files:** none (verification only)

**Purpose:** Final confirmation that the Week 1 deliverable meets all success criteria.

- [ ] **Step 1: Run full typecheck**

Run:
```bash
cd "c:/Users/Maor Feldman/Documents/Claude/Projects/couponscode-ai"
pnpm typecheck
```
Expected: all 7 packages pass with 0 errors.

- [ ] **Step 2: Run full build**

Run:
```bash
pnpm --filter @couponscode/web build
pnpm --filter admin-legacy build
```
Expected: both succeed.

- [ ] **Step 3: Start the legacy admin dev server and verify it boots**

Run:
```bash
pnpm --filter admin-legacy dev
```
Expected: dev server starts without errors. Open the URL in a browser. Confirm homepage loads.
Ctrl+C to stop.

- [ ] **Step 4: Start the new web app dev server and verify it boots**

Run:
```bash
pnpm --filter @couponscode/web dev
```
Expected: Next.js starts on http://localhost:3000. Open in browser — see "couponscode.ai — Coming soon — Week 2 build in progress."
Ctrl+C to stop.

- [ ] **Step 5: Verify staging migrations log**

Run:
```bash
cat docs/migrations-log.md
```
Expected: shows migrations 0001–0006 applied to staging, verified, with no pending rollbacks.

- [ ] **Step 6: Verify Week 1 success criteria**

Confirm each item in this checklist is true:

- [ ] Monorepo exists at `couponscode-ai/` with the full folder structure
- [ ] 3 apps scaffolded (`web`, `ingestion`, `admin-legacy`)
- [ ] 4 packages scaffolded (`contracts`, `db`, `llm`, `ui`)
- [ ] All 7 packages typecheck with 0 errors
- [ ] `apps/web` builds successfully
- [ ] `apps/admin-legacy` still builds and runs against the same Supabase DB it used before
- [ ] All 6 migrations (0001–0006) written, with matching rollback scripts
- [ ] All 6 migrations applied cleanly to staging DB
- [ ] RLS policies verified (anon cannot read private tables)
- [ ] Legacy admin verified functional against staging after RLS migration
- [ ] `packages/llm` has working router + adapter interface (stubbed)
- [ ] GitHub repo `maorfeld10/couponscode-ai` created and pushed
- [ ] CI workflow passing on GitHub Actions
- [ ] PRD, spec, and plan committed inside the monorepo

- [ ] **Step 7: Hand off to Week 2**

Create a final commit marking the Week 1 milestone:

Write `couponscode-ai/docs/WEEK1-COMPLETE.md`:
```md
# Week 1 Milestone — Monorepo Foundation Complete

**Date:** <YYYY-MM-DD when task completes>

## What shipped
- Monorepo `couponscode-ai` with pnpm workspaces
- Existing Vite admin relocated into `apps/admin-legacy/`, functional
- 4 scaffolded packages: contracts, db, llm, ui
- 3 scaffolded apps: web, ingestion, admin-legacy
- 6 DB migrations written and applied to staging Supabase
- RLS policies closing the biggest v1 security gap
- GitHub repo + CI passing

## What did NOT ship (deferred to Week 2)
- Merchant page rendering
- JSON-LD schema generator
- Click-out flow wiring
- Sitemap generation
- Newsletter endpoint
- FMTC ingestion
- Production DB migrations (staging only — production is user-gated)

## Next: Week 2 — Frontend SEO Core
See the next plan: `docs/superpowers/plans/YYYY-MM-DD-week2-frontend-seo-core.md` (to be written)
```

Run:
```bash
git add docs/WEEK1-COMPLETE.md
git commit -m "milestone: Week 1 monorepo foundation complete"
git push
```

---

## Self-Review Checklist

After completing all tasks above, verify:

**Spec coverage:**
- [x] Section 3 (Repo structure) → Tasks 2, 3, 4, 5
- [x] Section 4 (Frontend SEO core) → scaffold in Task 10, real implementation deferred to Week 2 plan
- [x] Section 5 (Ingestion pipeline) → scaffold in Task 11, real implementation deferred to Week 3 plan
- [x] Section 6 (DB contracts) → Tasks 13–20
- [x] Section 7 (LLM registry) → Tasks 8, 16
- [x] Section 8.4 (Security — RLS) → Task 19
- [x] Section 9.1 (Week 1 migration plan) → Tasks 1–23
- [x] Section 12 (Success criteria) → Task 24 checklist

**Placeholder scan:** No "TBD", "fill in", or vague "handle errors" language. All code blocks are complete.

**Type consistency:**
- `LLMProviderConfig` fields match between `packages/llm/src/types.ts` and migration 0003 — ✓
- `NetworkAdapter` interface matches between spec Section 5.1 and scaffold (deferred to Week 3)
- `RawMerchant`, `RawCoupon`, `HealthStatus` defined once in `packages/contracts/src/types.ts` and imported from `@couponscode/contracts` everywhere else

**Out of scope kept out:**
- Week 2 content (merchant page rendering, JSON-LD generator, click-out wiring) — deferred
- Week 3 content (FMTC adapter, Inngest jobs, date-refresh job) — deferred
- Production DB migration — deferred behind a second human gate in the next plan

---

**End of Week 1 Plan**
