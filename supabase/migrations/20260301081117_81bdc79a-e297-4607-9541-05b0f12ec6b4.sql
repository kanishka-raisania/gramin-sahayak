
-- 1. bulletin_items table
CREATE TABLE public.bulletin_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  source TEXT NOT NULL DEFAULT 'Government of India',
  image_url TEXT,
  publish_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_url TEXT,
  is_expiring BOOLEAN NOT NULL DEFAULT false,
  rss_guid TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_fetched_at TIMESTAMPTZ
);

ALTER TABLE public.bulletin_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read bulletin items"
  ON public.bulletin_items FOR SELECT USING (true);

CREATE INDEX idx_bulletin_items_category ON public.bulletin_items (category);
CREATE INDEX idx_bulletin_items_publish_date ON public.bulletin_items (publish_date DESC);

-- 2. chat_sessions table
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_role TEXT NOT NULL DEFAULT 'general',
  language TEXT NOT NULL DEFAULT 'hi',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert chat sessions"
  ON public.chat_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read chat sessions"
  ON public.chat_sessions FOR SELECT USING (true);

CREATE INDEX idx_chat_sessions_session_id ON public.chat_sessions (session_id);

-- 3. chat_messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert chat messages"
  ON public.chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read chat messages"
  ON public.chat_messages FOR SELECT USING (true);

CREATE INDEX idx_chat_messages_session_id ON public.chat_messages (session_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages (created_at);

-- Enable pg_cron and pg_net for scheduled RSS fetching
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
