-- Complete Database Setup Script
-- Run this ENTIRE script in Supabase SQL Editor
-- This will set up all tables, columns, and invite codes

-- ============================================
-- PART 1: CREATE TABLES (if they don't exist)
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code_id uuid REFERENCES invite_codes(id),
  anonymous_name text NOT NULL DEFAULT '',
  display_name text,
  avatar_url text,
  bio text,
  gender text,
  whatsapp_number text,
  room_number text,
  hobbies text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Invite codes table
CREATE TABLE IF NOT EXISTS invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  used boolean NOT NULL DEFAULT false,
  used_by uuid REFERENCES users(id)
);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reveal_a boolean NOT NULL DEFAULT false,
  reveal_b boolean NOT NULL DEFAULT false,
  reveal_type_a text DEFAULT 'none' CHECK (reveal_type_a IN ('none', 'whatsapp', 'room', 'both')),
  reveal_type_b text DEFAULT 'none' CHECK (reveal_type_b IN ('none', 'whatsapp', 'room', 'both')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_a, user_b),
  CHECK (user_a < user_b)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- PART 2: ADD COLUMNS (if they don't exist)
-- ============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_number text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS room_number text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hobbies text[] DEFAULT '{}';

ALTER TABLE matches ADD COLUMN IF NOT EXISTS reveal_type_a text DEFAULT 'none' CHECK (reveal_type_a IN ('none', 'whatsapp', 'room', 'both'));
ALTER TABLE matches ADD COLUMN IF NOT EXISTS reveal_type_b text DEFAULT 'none' CHECK (reveal_type_b IN ('none', 'whatsapp', 'room', 'both'));

ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url text;

-- ============================================
-- PART 3: ADD CONSTRAINTS
-- ============================================

-- Drop existing constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_whatsapp_number_unique;

-- Add unique constraint for WhatsApp number
ALTER TABLE users ADD CONSTRAINT users_whatsapp_number_unique UNIQUE (whatsapp_number);

-- ============================================
-- PART 4: CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_requests_sender ON requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_requests_receiver ON requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_matches_user_a ON matches(user_a);
CREATE INDEX IF NOT EXISTS idx_matches_user_b ON matches(user_b);
CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- ============================================
-- PART 5: CLEAN UP AND SET UP INVITE CODES
-- ============================================

-- Step 1: Clear the used_by references in invite_codes first
-- This breaks the foreign key constraint from invite_codes to users
UPDATE invite_codes SET used_by = NULL, used = false;

-- Step 2: Now we can delete users (they reference invite_codes via invite_code_id)
-- This will cascade delete messages, matches, and requests
DELETE FROM users;

-- Step 3: Now we can safely delete all invite codes
DELETE FROM invite_codes;

-- Step 4: Insert all invite codes fresh
INSERT INTO invite_codes (code, used) 
VALUES 
  ('besideCHAT123', false),
  ('valentine1', false),
  ('innamorati12', false),
  ('innamorati1', false);

-- Verify all codes were added
SELECT 
  code, 
  used,
  id
FROM invite_codes 
ORDER BY code;

