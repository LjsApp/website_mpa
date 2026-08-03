ALTER TABLE public.company_info
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS facebook_url text,
  ADD COLUMN IF NOT EXISTS youtube_url text;

CREATE INDEX IF NOT EXISTS idx_products_category_sort ON public.products (category, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_sort ON public.products (sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_category_sort ON public.projects (category, sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_sort ON public.projects (sort_order);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles (category);
CREATE INDEX IF NOT EXISTS idx_brands_sort ON public.brands (sort_order);
CREATE INDEX IF NOT EXISTS idx_clients_sort ON public.clients (sort_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_sort ON public.testimonials (sort_order);