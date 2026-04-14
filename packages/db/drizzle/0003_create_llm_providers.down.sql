-- Rollback migration 0003

BEGIN;

DROP INDEX IF EXISTS idx_llm_providers_role_priority;
DROP TABLE IF EXISTS llm_providers;

COMMIT;
