-- Jalankan script ini di SQL Editor Supabase Anda untuk menambahkan field baru dan menghapus field phone

ALTER TABLE public.company_info
  ADD COLUMN IF NOT EXISTS address_ro TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_2 TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_3 TEXT,
  ADD COLUMN IF NOT EXISTS maps_embed_ro TEXT,
  DROP COLUMN IF EXISTS phone;
