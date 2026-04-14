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
