-- Add project_date column to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_date date;
