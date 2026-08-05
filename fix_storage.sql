-- ============================================================
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Tambah kolom project_date & hapus year dari projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_date date;
ALTER TABLE public.projects DROP COLUMN IF EXISTS year;

-- 2. Tambah kolom documents (dokumen perusahaan) ke company_info
ALTER TABLE public.company_info ADD COLUMN IF NOT EXISTS documents jsonb NOT NULL DEFAULT '[]'::jsonb;
