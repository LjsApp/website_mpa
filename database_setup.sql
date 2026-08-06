-- Script ini aman untuk dijalankan berkali-kali (idempotent)
-- Salin semua isi ini dan jalankan di SQL Editor Supabase Anda

-- ============================================================
-- 1. Tabel Newsletter Subscribers
-- ============================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama agar tidak error
DROP POLICY IF EXISTS "Allow public insert to newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow authenticated full access to newsletter" ON public.newsletter_subscribers;

-- Pengunjung publik bisa mendaftar (INSERT)
CREATE POLICY "Allow public insert to newsletter" ON public.newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Admin (authenticated) bisa baca, update, dan hapus
CREATE POLICY "Allow authenticated full access to newsletter" ON public.newsletter_subscribers
  FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================================
-- 2. Tabel Page Views (Statistik Kunjungan)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama agar tidak error
DROP POLICY IF EXISTS "Allow public insert to page views" ON public.page_views;
DROP POLICY IF EXISTS "Allow authenticated read page views" ON public.page_views;

-- Semua pengunjung bisa mencatat kunjungan
CREATE POLICY "Allow public insert to page views" ON public.page_views
  FOR INSERT
  WITH CHECK (true);

-- Admin bisa membaca data statistik
CREATE POLICY "Allow authenticated read page views" ON public.page_views
  FOR SELECT
  USING (auth.role() = 'authenticated');
