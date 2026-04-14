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
