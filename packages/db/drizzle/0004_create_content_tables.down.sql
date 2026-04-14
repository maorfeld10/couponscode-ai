-- Rollback migration 0004

BEGIN;

DROP INDEX IF EXISTS idx_content_published_type_date;
DROP INDEX IF EXISTS idx_content_published_slug;
DROP TABLE IF EXISTS content_published;

DROP INDEX IF EXISTS idx_content_drafts_status;
DROP TABLE IF EXISTS content_drafts;

DROP INDEX IF EXISTS idx_topic_queue_status_priority;
DROP TABLE IF EXISTS topic_queue;

COMMIT;
