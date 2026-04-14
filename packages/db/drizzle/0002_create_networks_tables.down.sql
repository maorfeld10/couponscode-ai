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
