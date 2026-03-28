create extension if not exists pgcrypto;

create table if not exists public.carousel_drafts (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  format text not null,
  input text not null,
  cover_headline text not null,
  cover_subheadline text,
  slides_json jsonb not null,
  caption text not null,
  final_cta text not null,
  created_at timestamptz not null default now()
);
