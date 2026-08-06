-- Jalankan skrip ini di SQL Editor Supabase untuk membuat tabel Newsletter Subscribers

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed'))
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert their email (anon)
CREATE POLICY "Allow public insert to newsletter" ON public.newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Only authenticated admins can view the subscribers
CREATE POLICY "Allow authenticated read" ON public.newsletter_subscribers
  FOR SELECT
  USING (auth.role() = 'authenticated');
