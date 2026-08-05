-- ============================================================
-- Jalankan di Supabase Dashboard → SQL Editor
-- Tambah kolom project_date & hapus kolom year dari tabel projects
-- ============================================================

-- 1. Tambah kolom tanggal proyek (jika belum ada)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_date date;

-- 2. Hapus kolom year (digantikan project_date)
ALTER TABLE public.projects DROP COLUMN IF EXISTS year;
