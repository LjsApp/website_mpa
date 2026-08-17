-- ============================================================
-- MIGRATION: Cleanup Tracking Tables
-- Jalankan SQL ini di Supabase SQL Editor
-- ============================================================

-- 1. Hapus tabel tracking_updates yang sudah tidak digunakan
DROP TABLE IF EXISTS tracking_updates CASCADE;

-- 2. Hapus kolom status dari order_trackings (tidak dipakai lagi,
--    status sekarang diambil langsung dari BinderByte API)
ALTER TABLE order_trackings DROP COLUMN IF EXISTS status;

-- 3. Hapus kolom event_date dari order_trackings jika ada
ALTER TABLE order_trackings DROP COLUMN IF EXISTS event_date;

-- Verifikasi hasil: struktur tabel order_trackings setelah migration
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'order_trackings' ORDER BY ordinal_position;
