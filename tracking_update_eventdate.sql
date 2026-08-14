-- ==========================================
-- ADD event_date TO tracking_updates
-- Jalankan di Supabase SQL Editor
-- ==========================================

ALTER TABLE public.tracking_updates
  ADD COLUMN IF NOT EXISTS event_date TIMESTAMPTZ;

-- Isi event_date dari created_at untuk data yang sudah ada
UPDATE public.tracking_updates
  SET event_date = created_at
  WHERE event_date IS NULL;

-- Update juga fungsi pengurutan: gunakan event_date jika diset, fallback ke created_at
-- (query di app sudah tangani ini via COALESCE)
