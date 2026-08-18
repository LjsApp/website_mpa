-- Add quote column to company_admins table
ALTER TABLE company_admins ADD COLUMN IF NOT EXISTS quote text;
