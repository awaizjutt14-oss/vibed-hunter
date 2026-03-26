create table if not exists public.generation_usage (
  user_id text primary key,
  user_email text,
  free_posts_used integer not null default 0,
  is_paid boolean not null default false,
  subscription_status text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists generation_usage_user_email_idx
  on public.generation_usage (user_email);

create table if not exists public.generation_usage_events (
  event_id text primary key,
  user_id text not null,
  action text not null,
  created_at timestamptz not null default now()
);
