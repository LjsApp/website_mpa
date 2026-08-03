ALTER TABLE public.clients DROP COLUMN IF EXISTS industry;
CREATE UNIQUE INDEX IF NOT EXISTS company_info_singleton ON public.company_info ((true));