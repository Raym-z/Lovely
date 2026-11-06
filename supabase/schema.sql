-- Run this in the Supabase SQL editor before using the hosted store.
-- Content is compressed with lz-string before it is written.

create table if not exists public.lovely_pages (
  id text primary key,
  config text not null,
  edit_key_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lovely_pages_config_size check (char_length(config) <= 90000)
);

alter table public.lovely_pages enable row level security;

-- Intentionally no policies: the table is read and written only by the
-- server-side service role key. Shared pages are served through Next.js.
