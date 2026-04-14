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
