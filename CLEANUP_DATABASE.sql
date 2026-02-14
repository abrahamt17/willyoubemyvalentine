-- Cleanup Database Script
-- Run this in Supabase SQL Editor to remove all users and related data
-- WARNING: This will delete ALL users and their data!

-- Delete all messages (they reference users via sender_id)
DELETE FROM messages;

-- Delete all matches (they reference users via user_a and user_b)
DELETE FROM matches;

-- Delete all requests (they reference users via sender_id and receiver_id)
DELETE FROM requests;

-- Delete all users
DELETE FROM users;

-- Verify cleanup (should return 0 rows)
SELECT 
  (SELECT COUNT(*) FROM users) as user_count,
  (SELECT COUNT(*) FROM messages) as message_count,
  (SELECT COUNT(*) FROM matches) as match_count,
  (SELECT COUNT(*) FROM requests) as request_count;

-- Note: Invite codes are NOT deleted - they can be reused

