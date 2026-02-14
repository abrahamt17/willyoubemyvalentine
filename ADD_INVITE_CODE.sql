-- Add the invite code to your Supabase database
-- Run this in Supabase SQL Editor

-- First, check if the code already exists (case-insensitive)
-- Delete any old variations if they exist
DELETE FROM invite_codes WHERE LOWER(code) = LOWER('innamorati1');

-- Insert the new code (you can use lowercase, it will work case-insensitively)
INSERT INTO invite_codes (code, used) 
VALUES ('innamorati1', false)
ON CONFLICT (code) DO NOTHING;

-- Verify it was added
SELECT * FROM invite_codes WHERE LOWER(code) = LOWER('innamorati1');

