-- Migration 0006: Row Level Security policies
--
-- WARNING: This migration restricts access to sensitive tables.
-- Before running, ensure at least one admin exists in admin_users with status='active',
-- and that the service_role key is available as an emergency backdoor.

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

-- merchants
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

-- coupons
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

-- categories
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

-- click_events: public insert, admin read
ALTER TABLE click_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS click_events_public_insert ON click_events;
CREATE POLICY click_events_public_insert ON click_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS click_events_admin_select ON click_events;
CREATE POLICY click_events_admin_select ON click_events
  FOR SELECT TO authenticated USING (is_active_admin());

-- site_users: public insert, admin all
ALTER TABLE site_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS site_users_public_insert ON site_users;
CREATE POLICY site_users_public_insert ON site_users
  FOR INSERT TO anon, authenticated WITH CHECK (true);
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

-- admin_users
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

-- audit_logs: immutable, admin read
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_logs_admin_select ON audit_logs;
CREATE POLICY audit_logs_admin_select ON audit_logs
  FOR SELECT TO authenticated USING (is_active_admin());
DROP POLICY IF EXISTS audit_logs_admin_insert ON audit_logs;
CREATE POLICY audit_logs_admin_insert ON audit_logs
  FOR INSERT TO authenticated WITH CHECK (is_active_admin());

-- ingestion_runs, refresh_runs, content_drafts, topic_queue: admin only
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

-- content_published: public read, admin write
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

-- sessions: public insert, admin read
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sessions_public_insert ON sessions;
CREATE POLICY sessions_public_insert ON sessions
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS sessions_admin_select ON sessions;
CREATE POLICY sessions_admin_select ON sessions
  FOR SELECT TO authenticated USING (is_active_admin());

-- conversions: admin only
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS conversions_admin_all ON conversions;
CREATE POLICY conversions_admin_all ON conversions
  FOR ALL TO authenticated USING (is_active_admin()) WITH CHECK (is_active_admin());

COMMIT;
