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
