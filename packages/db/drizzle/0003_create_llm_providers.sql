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
