-- Add invite codes to your Supabase database
-- Run this in Supabase SQL Editor

-- Add all invite codes (case-insensitive matching is now supported)
INSERT INTO invite_codes (code, used) 
VALUES 
  ('besideCHAT123', false),
  ('valentine1', false),
  ('innamorati12', false)
ON CONFLICT (code) DO UPDATE SET used = false;

-- Verify all codes were added
SELECT * FROM invite_codes 
WHERE LOWER(code) IN (
  LOWER('besideCHAT123'), 
  LOWER('valentine1'), 
  LOWER('innamorati12')
)
ORDER BY code;

