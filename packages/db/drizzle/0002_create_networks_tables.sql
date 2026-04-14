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
