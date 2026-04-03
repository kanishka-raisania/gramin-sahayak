
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  name text,
  role text NOT NULL DEFAULT 'citizen',
  language text NOT NULL DEFAULT 'hi',
  state text,
  district text,
  age_group text,
  gender text,
  interaction_tags text[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read own profile" ON public.user_profiles
  FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can insert profile" ON public.user_profiles
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can update own profile" ON public.user_profiles
  FOR UPDATE TO public USING (true) WITH CHECK (true);
