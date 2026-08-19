-- Add source and original_url to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS source text DEFAULT 'admin';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS original_url text;
