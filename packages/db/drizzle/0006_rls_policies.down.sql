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
