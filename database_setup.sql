-- Jalankan seluruh skrip ini di SQL Editor Supabase Anda

-- 1. Tabel Pelanggan Newsletter
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed'))
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to newsletter" ON public.newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to newsletter" ON public.newsletter_subscribers
  FOR ALL
  USING (auth.role() = 'authenticated');


-- 2. Tabel Statistik Kunjungan (Page Views)
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to page views" ON public.page_views
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated read page views" ON public.page_views
  FOR SELECT
  USING (auth.role() = 'authenticated');
