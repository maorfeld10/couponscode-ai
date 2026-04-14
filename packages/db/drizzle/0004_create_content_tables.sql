-- Migration 0004: Create content pipeline tables (Subsystem 4)

BEGIN;

CREATE TABLE IF NOT EXISTS topic_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  source text NOT NULL CHECK (source IN ('trending', 'holiday', 'expiring', 'manual', 'gsc')),
  priority integer NOT NULL DEFAULT 0,
  scheduled_for timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'drafting', 'done', 'skipped')),
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_topic_queue_status_priority ON topic_queue(status, priority DESC, scheduled_for);

CREATE TABLE IF NOT EXISTS content_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('blog', 'about', 'faq', 'guide', 'category_intro')),
  target_id uuid,
  title text,
  body_md text,
  body_html text,
  schema_jsonld jsonb,
  llm_provider text,
  llm_model text,
  prompt_version text,
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'scheduled')),
  feedback text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_drafts_status ON content_drafts(status, created_at DESC);

CREATE TABLE IF NOT EXISTS content_published (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid REFERENCES content_drafts(id) ON DELETE SET NULL,
  type text NOT NULL,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  body_html text NOT NULL,
  schema_jsonld jsonb,
  publish_date timestamptz NOT NULL DEFAULT NOW(),
  last_refreshed_at timestamptz NOT NULL DEFAULT NOW(),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_published_slug ON content_published(slug);
CREATE INDEX IF NOT EXISTS idx_content_published_type_date ON content_published(type, publish_date DESC);

COMMIT;
