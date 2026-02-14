-- Add hobbies column to users table
-- Run this in Supabase SQL Editor

ALTER TABLE users
ADD COLUMN IF NOT EXISTS hobbies TEXT[] DEFAULT '{}';

