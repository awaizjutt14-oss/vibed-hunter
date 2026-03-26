create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  user_email text not null unique,
  created_at timestamptz not null default now()
);
