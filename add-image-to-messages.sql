-- Add image_url column to messages table
-- Run this in Supabase SQL Editor

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS image_url TEXT;

