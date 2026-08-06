-- Skrip ini khusus untuk membuat tabel Statistik Kunjungan (Page Views)
-- Silakan jalankan di SQL Editor Supabase Anda

CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Hapus policy jika sudah ada agar tidak error saat di-run ulang
DROP POLICY IF EXISTS "Allow public insert to page views" ON public.page_views;
DROP POLICY IF EXISTS "Allow authenticated read page views" ON public.page_views;

CREATE POLICY "Allow public insert to page views" ON public.page_views
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated read page views" ON public.page_views
  FOR SELECT
  USING (auth.role() = 'authenticated');
