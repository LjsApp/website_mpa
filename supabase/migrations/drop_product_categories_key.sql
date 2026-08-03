-- Migration: remove 'key' column from product_categories
-- Run this in Supabase Dashboard > SQL Editor

-- 1. Drop NOT NULL constraint first (make it nullable)
ALTER TABLE product_categories ALTER COLUMN "key" DROP NOT NULL;

-- 2. Drop the column entirely
ALTER TABLE product_categories DROP COLUMN IF EXISTS "key";
