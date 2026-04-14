-- Migration 0000: Baseline schema for fresh Supabase project
-- Creates all tables needed by the legacy Vite admin AND the new Next.js app.
-- Combines the old schema.sql with previously-missing tables that the app code references.
-- Safe to run on an empty database. Uses IF NOT EXISTS throughout for idempotency.

BEGIN;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- A. admin_users
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('super_admin', 'editor', 'coupon_manager', 'content_manager')),
  status TEXT CHECK (status IN ('active', 'inactive', 'invited')) DEFAULT 'invited',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- B. site_users (newsletter signups)
-- ============================================================================
CREATE TABLE IF NOT EXISTS site_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  source TEXT CHECK (source IN ('merchant_page', 'coupon_modal', 'review_page', 'homepage_signup', 'other')),
  merchant_id UUID,
  status TEXT CHECK (status IN ('active', 'unsubscribed')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- C. merchants (core store profiles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id_display TEXT UNIQUE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  homepage_link TEXT,
  description TEXT,
  short_description TEXT,
  tracking_link TEXT,
  affiliate_platform_name TEXT,
  category TEXT,
  logo_url TEXT,
  status TEXT CHECK (status IN ('active', 'inactive', 'draft', 'hidden')) DEFAULT 'draft',
  is_visible BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  merchant_brief TEXT,
  about_merchant TEXT,
  store_info TEXT,
  faq_content JSONB,
  buying_guide_preview TEXT,
  savings_guide_preview TEXT,
  popular_searches TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- D. coupons
-- ============================================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id_display TEXT UNIQUE,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  short_description TEXT,
  coupon_code TEXT,
  deal_type TEXT CHECK (deal_type IN ('code', 'deal', 'sale', 'free_shipping')),
  tracking_link TEXT,
  deep_link_override TEXT,
  source_type TEXT CHECK (source_type IN ('manual', 'affiliate', 'crawler', 'placeholder')),
  coupon_status TEXT CHECK (coupon_status IN ('active', 'expired', 'hidden', 'draft')) DEFAULT 'draft',
  is_exclusive BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT FALSE,
  expiration_date TIMESTAMPTZ,
  priority_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- E. categories (new system, referenced by 0006 RLS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- F. merchant_categories (M:N join)
-- ============================================================================
CREATE TABLE IF NOT EXISTS merchant_categories (
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (merchant_id, category_id)
);

-- ============================================================================
-- G. merchant_private_data (sensitive admin-only data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS merchant_private_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID UNIQUE NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  merchant_name TEXT,
  fmtc_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- H. click_events (outbound click analytics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS click_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  merchant_name TEXT,
  coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  coupon_title TEXT,
  coupon_code TEXT,
  deal_type TEXT,
  page_type TEXT,
  click_type TEXT CHECK (click_type IN ('show_code', 'get_deal')),
  tracking_link TEXT,
  page_path TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- I. legal_pages
-- ============================================================================
CREATE TABLE IF NOT EXISTS legal_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  body_text TEXT,
  status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- J. articles (legacy editorial content — retained for admin-legacy compatibility)
-- ============================================================================
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id_display TEXT UNIQUE,
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  slug TEXT UNIQUE NOT NULL,
  author TEXT,
  cover_image_url TEXT,
  body_content TEXT,
  status TEXT CHECK (status IN ('draft', 'published', 'hidden')) DEFAULT 'draft',
  publish_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- K. editorial_pages (legacy)
-- ============================================================================
CREATE TABLE IF NOT EXISTS editorial_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  page_type TEXT CHECK (page_type IN ('top_10_deals', 'best_stores', 'comparison')),
  intro_text TEXT,
  body_content TEXT,
  status TEXT CHECK (status IN ('draft', 'published', 'hidden')) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- L. assets (centralized file registry)
-- ============================================================================
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_name TEXT NOT NULL,
  asset_type TEXT CHECK (asset_type IN ('merchant_logo', 'article_image', 'editorial_image', 'generic_asset')),
  linked_entity_type TEXT,
  linked_entity_id UUID,
  file_url TEXT NOT NULL,
  file_size TEXT,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- M. audit_logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  admin_email TEXT,
  action_type TEXT CHECK (action_type IN ('created', 'edited', 'published', 'hidden', 'deleted', 'invited', 'exported')),
  entity_type TEXT,
  entity_id UUID,
  entity_name TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- N. keyword_clickout_rules (legacy)
-- ============================================================================
CREATE TABLE IF NOT EXISTS keyword_clickout_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  tracking_link TEXT,
  replace_mode TEXT CHECK (replace_mode IN ('first_occurrence', 'all_occurrences')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_merchants_slug ON merchants(slug);
CREATE INDEX IF NOT EXISTS idx_merchants_status ON merchants(status);
CREATE INDEX IF NOT EXISTS idx_merchants_is_visible ON merchants(is_visible) WHERE is_visible = TRUE;
CREATE INDEX IF NOT EXISTS idx_coupons_merchant_id ON coupons(merchant_id);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(coupon_status);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_merchant_categories_category ON merchant_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_click_events_merchant ON click_events(merchant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_click_events_created ON click_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_merchant_id ON articles(merchant_id);
CREATE INDEX IF NOT EXISTS idx_site_users_merchant_id ON site_users(merchant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_user_id ON audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_keyword_rules_article_id ON keyword_clickout_rules(article_id);

COMMIT;
