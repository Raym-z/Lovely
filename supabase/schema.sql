-- Run this in the Supabase SQL editor before using the hosted store.
-- Content is compressed with lz-string before it is written.

create table if not exists public.lovely_pages (
  id text primary key,
  config text not null,
  edit_key_hash text not null,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lovely_pages_config_size check (char_length(config) <= 90000)
);

alter table public.lovely_pages
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

create index if not exists lovely_pages_owner_id_idx
  on public.lovely_pages (owner_id);

alter table public.lovely_pages enable row level security;

-- The app writes through the server-side service role key. These policies
-- let authenticated owners (including anonymous guests) read and update
-- only their own pages if they ever query Supabase directly.
drop policy if exists "Owners can read their Lovely pages" on public.lovely_pages;
create policy "Owners can read their Lovely pages"
  on public.lovely_pages
  for select
  to authenticated
  using (auth.uid() = owner_id);

drop policy if exists "Owners can update their Lovely pages" on public.lovely_pages;
create policy "Owners can update their Lovely pages"
  on public.lovely_pages
  for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
