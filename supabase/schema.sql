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

-- Adds uploaded-photo metadata, page references, and the public storage bucket.
-- Image writes go through server routes using the service role after
-- validating the owner session or the page's edit key.

create table if not exists public.lovely_images (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  storage_path text not null unique,
  mime_type text not null check (mime_type in ('image/webp', 'image/jpeg')),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  bytes bigint not null check (bytes > 0),
  original_filename text,
  checksum text,
  uploaded_by_user_id uuid references auth.users(id) on delete set null,
  upload_method text not null check (upload_method in ('owner_session', 'edit_key')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lovely_images_owner_id_idx
  on public.lovely_images (owner_id, created_at desc);

create table if not exists public.lovely_image_references (
  id uuid primary key default gen_random_uuid(),
  image_id uuid not null references public.lovely_images(id) on delete restrict,
  page_id text not null references public.lovely_pages(id) on delete cascade,
  memory_id text not null,
  created_at timestamptz not null default now(),
  unique (page_id, memory_id)
);

create index if not exists lovely_image_references_image_id_idx
  on public.lovely_image_references (image_id);

create index if not exists lovely_image_references_page_id_idx
  on public.lovely_image_references (page_id);

alter table public.lovely_images enable row level security;
alter table public.lovely_image_references enable row level security;

drop policy if exists "Owners can read their Lovely images" on public.lovely_images;
create policy "Owners can read their Lovely images"
  on public.lovely_images
  for select
  to authenticated
  using (auth.uid() = owner_id);

drop policy if exists "Owners can read their Lovely image references" on public.lovely_image_references;
create policy "Owners can read their Lovely image references"
  on public.lovely_image_references
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.lovely_pages page
      where page.id = page_id
        and page.owner_id = auth.uid()
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lovely-images',
  'lovely-images',
  true,
  1200000,
  array['image/webp', 'image/jpeg']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read Lovely images" on storage.objects;
create policy "Public can read Lovely images"
  on storage.objects
  for select
  to public
  using (bucket_id = 'lovely-images');

-- No public insert/update/delete policies. Uploads, replacements, and
-- deletions are performed server-side with the service role after
-- owner/edit-key authorization.
