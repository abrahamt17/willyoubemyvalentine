-- Add room_number column to users table
-- Run this in Supabase SQL Editor

ALTER TABLE users
ADD COLUMN IF NOT EXISTS room_number TEXT;

-- Add reveal_type to matches table to track what was revealed
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS reveal_type_a TEXT DEFAULT 'none' CHECK (reveal_type_a IN ('none', 'whatsapp', 'room', 'both'));
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS reveal_type_b TEXT DEFAULT 'none' CHECK (reveal_type_b IN ('none', 'whatsapp', 'room', 'both'));

