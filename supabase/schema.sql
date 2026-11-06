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

-- Transfers data owned by an anonymous guest UID to an existing registered UID.
-- The application calls the function only after independently verifying both
-- bearer tokens through Supabase Auth.

create table if not exists public.lovely_account_transfers (
  id uuid primary key default gen_random_uuid(),
  source_guest_uid uuid not null unique,
  destination_user_uid uuid not null,
  status text not null check (status in ('completed')),
  pages_transferred integer not null default 0 check (pages_transferred >= 0),
  images_transferred integer not null default 0 check (images_transferred >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists lovely_account_transfers_destination_idx
  on public.lovely_account_transfers (destination_user_uid, completed_at desc);

alter table public.lovely_account_transfers enable row level security;

-- No public policies: transfers are written only through the secured function.

create or replace function public.transfer_guest_ownership(
  p_source_guest uuid,
  p_destination_user uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_source_is_anonymous boolean;
  v_destination_is_anonymous boolean;
  v_existing public.lovely_account_transfers%rowtype;
  v_pages integer := 0;
  v_images integer := 0;
  v_claimed integer := 0;
begin
  if p_source_guest is null or p_destination_user is null then
    raise exception 'INVALID_IDENTITIES';
  end if;

  if p_source_guest = p_destination_user then
    raise exception 'SAME_IDENTITY';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_source_guest::text, 0));

  select is_anonymous into v_source_is_anonymous
  from auth.users
  where id = p_source_guest;

  if v_source_is_anonymous is null then
    raise exception 'SOURCE_NOT_FOUND';
  end if;

  if v_source_is_anonymous is not true then
    raise exception 'SOURCE_NOT_ANONYMOUS';
  end if;

  select is_anonymous into v_destination_is_anonymous
  from auth.users
  where id = p_destination_user;

  if v_destination_is_anonymous is null then
    raise exception 'DESTINATION_NOT_FOUND';
  end if;

  if v_destination_is_anonymous is true then
    raise exception 'DESTINATION_ANONYMOUS';
  end if;

  select *
  into v_existing
  from public.lovely_account_transfers
  where source_guest_uid = p_source_guest
  for update;

  if found then
    if v_existing.destination_user_uid <> p_destination_user then
      raise exception 'GUEST_ALREADY_TRANSFERRED';
    end if;

    return jsonb_build_object(
      'status', 'already_completed',
      'pages', v_existing.pages_transferred,
      'images', v_existing.images_transferred,
      'destination_user_uid', v_existing.destination_user_uid
    );
  end if;

  update public.lovely_pages
  set owner_id = p_destination_user
  where owner_id = p_source_guest;

  get diagnostics v_pages = row_count;

  update public.lovely_images
  set owner_id = p_destination_user
  where owner_id = p_source_guest;

  get diagnostics v_images = row_count;

  if v_pages > 0 then
    update public.lovely_images i
    set owner_id = p_destination_user
    where i.owner_id is null
      and exists (
        select 1
        from public.lovely_image_references r
        join public.lovely_pages p on p.id = r.page_id
        where r.image_id = i.id
          and p.owner_id = p_destination_user
      );

    get diagnostics v_claimed = row_count;
    v_images := v_images + v_claimed;
  end if;

  if v_pages = 0 and v_images = 0 then
    return jsonb_build_object(
      'status', 'nothing_to_transfer',
      'pages', 0,
      'images', 0,
      'destination_user_uid', p_destination_user
    );
  end if;

  insert into public.lovely_account_transfers (
    source_guest_uid,
    destination_user_uid,
    status,
    pages_transferred,
    images_transferred,
    metadata,
    completed_at
  )
  values (
    p_source_guest,
    p_destination_user,
    'completed',
    v_pages,
    v_images,
    jsonb_build_object(
      'storage_paths_moved', false,
      'edit_keys_preserved', true
    ),
    now()
  )
  on conflict (source_guest_uid) do nothing;

  return jsonb_build_object(
    'status', 'completed',
    'pages', v_pages,
    'images', v_images,
    'destination_user_uid', p_destination_user
  );
end;
$$;

revoke all on function public.transfer_guest_ownership(uuid, uuid) from public;
revoke all on function public.transfer_guest_ownership(uuid, uuid) from anon;
revoke all on function public.transfer_guest_ownership(uuid, uuid) from authenticated;
grant execute on function public.transfer_guest_ownership(uuid, uuid) to service_role;
