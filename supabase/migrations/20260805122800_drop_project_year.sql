-- Drop year column from projects table (replaced by project_date)
ALTER TABLE public.projects DROP COLUMN IF EXISTS year;
