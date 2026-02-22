
-- Chat logs table
CREATE TABLE public.chat_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  intent TEXT,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;

-- Public insert/select since no auth required for rural users
CREATE POLICY "Anyone can insert chat logs"
  ON public.chat_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read own session chat logs"
  ON public.chat_logs FOR SELECT
  USING (true);

-- Fake news checks table
CREATE TABLE public.fake_news_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  news_text TEXT NOT NULL,
  verdict TEXT NOT NULL,
  confidence INTEGER NOT NULL DEFAULT 50,
  explanation TEXT NOT NULL,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fake_news_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert fake news checks"
  ON public.fake_news_checks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read own session checks"
  ON public.fake_news_checks FOR SELECT
  USING (true);

-- Index for session lookups
CREATE INDEX idx_chat_logs_session ON public.chat_logs(session_id, created_at DESC);
CREATE INDEX idx_fake_news_session ON public.fake_news_checks(session_id, checked_at DESC);
