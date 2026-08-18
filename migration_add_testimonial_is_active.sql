-- Tambahkan kolom is_active ke tabel testimonials
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL;
