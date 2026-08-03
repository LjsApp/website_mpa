-- =============================================
-- MIGRATION: Galeri Produk & Hapus Kolom image_url
-- Jalankan di Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Tambahkan kolom gallery pada tabel products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS gallery jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 2. Migrasi data lama: pindahkan image_url yang ada ke gallery[0]
UPDATE products
  SET gallery = jsonb_build_array(image_url)
  WHERE image_url IS NOT NULL AND image_url <> '';

-- 3. Hapus kolom image_url dari tabel products
ALTER TABLE products
  DROP COLUMN IF EXISTS image_url;

-- 4. Migrasi data proyek: pindahkan image_url ke gallery[0] (jika gallery masih kosong)
UPDATE projects
  SET gallery = jsonb_build_array(image_url) || gallery
  WHERE image_url IS NOT NULL
    AND image_url <> ''
    AND (gallery IS NULL OR gallery = '[]'::jsonb);

-- 5. Hapus kolom image_url dari tabel projects
ALTER TABLE projects
  DROP COLUMN IF EXISTS image_url;
