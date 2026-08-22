-- Migration: Add why_us column to company_info
-- Run this in Supabase SQL Editor

ALTER TABLE company_info
ADD COLUMN IF NOT EXISTS why_us jsonb DEFAULT '[]'::jsonb;
