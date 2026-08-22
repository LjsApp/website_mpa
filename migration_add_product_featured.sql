-- Tambah kolom is_featured pada tabel products
-- Jalankan di Supabase SQL Editor

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
