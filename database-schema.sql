-- Complete database schema for Valentine matching app
-- Run this in Supabase SQL Editor

-- Users table (already exists, but including for reference)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  invite_code_id uuid references invite_codes(id),
  anonymous_name text not null default '',
  display_name text,
  avatar_url text,
  bio text,
  gender text,
  whatsapp_number text unique,
  created_at timestamptz not null default now()
);

-- Invite codes table (already exists)
create table if not exists invite_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  used boolean not null default false,
  used_by uuid references users(id)
);

-- Requests table: when user A sends a request to user B
create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references users(id) on delete cascade,
  receiver_id uuid not null references users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'matched', 'cancelled')),
  created_at timestamptz not null default now(),
  unique(sender_id, receiver_id),
  check (sender_id != receiver_id)
);

-- Matches table: created when both users request each other
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references users(id) on delete cascade,
  user_b uuid not null references users(id) on delete cascade,
  reveal_a boolean not null default false,
  reveal_b boolean not null default false,
  created_at timestamptz not null default now(),
  unique(user_a, user_b),
  check (user_a < user_b)
);

-- Messages table: messages between matched users
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  sender_id uuid not null references users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_requests_sender on requests(sender_id);
create index if not exists idx_requests_receiver on requests(receiver_id);
create index if not exists idx_requests_status on requests(status);
create index if not exists idx_matches_user_a on matches(user_a);
create index if not exists idx_matches_user_b on matches(user_b);
create index if not exists idx_messages_match on messages(match_id);
create index if not exists idx_messages_created on messages(created_at);

