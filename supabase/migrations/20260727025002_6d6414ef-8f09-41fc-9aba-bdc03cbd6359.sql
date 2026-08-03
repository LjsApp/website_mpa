ALTER TABLE public.company_info
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS maps_embed text,
  ADD COLUMN IF NOT EXISTS iso_images jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS category text;