-- Ensure rss_guid uniqueness for safe upserts (allows multiple NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS bulletin_items_rss_guid_key
  ON public.bulletin_items (rss_guid)
  WHERE rss_guid IS NOT NULL;

-- Speed up sorted reads
CREATE INDEX IF NOT EXISTS bulletin_items_publish_date_idx
  ON public.bulletin_items (publish_date DESC);

CREATE INDEX IF NOT EXISTS bulletin_items_category_idx
  ON public.bulletin_items (category);

-- Enable extensions for cron-based RSS polling
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;