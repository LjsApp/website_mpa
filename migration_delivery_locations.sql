-- Hapus kolom delivery_locations dari tabel company_info (karena kita pindah ke clients)
ALTER TABLE company_info
  DROP COLUMN IF EXISTS delivery_locations;

-- Tambah kolom lokasi pada tabel clients
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS lat double precision,
  ADD COLUMN IF NOT EXISTS lng double precision,
  ADD COLUMN IF NOT EXISTS pin_icon text DEFAULT 'default';
