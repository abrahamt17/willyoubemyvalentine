-- Add invite codes to your Supabase database
-- Run this in Supabase SQL Editor
-- This script handles existing codes gracefully

-- First, delete any existing codes with these exact values (case-sensitive)
-- This ensures we start fresh
DELETE FROM invite_codes 
WHERE code IN ('besideCHAT123', 'valentine1', 'innamorati12', 'innamorati1');

-- Now insert all invite codes
INSERT INTO invite_codes (code, used) 
VALUES 
  ('besideCHAT123', false),
  ('valentine1', false),
  ('innamorati12', false),
  ('innamorati1', false);

-- Verify all codes were added
SELECT * FROM invite_codes 
WHERE code IN ('besideCHAT123', 'valentine1', 'innamorati12', 'innamorati1')
ORDER BY code;

