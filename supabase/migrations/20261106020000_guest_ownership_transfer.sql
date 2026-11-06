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
    update public.lovely_images image
    set owner_id = p_destination_user
    where image.owner_id is null
      and exists (
        select 1
        from public.lovely_image_references reference
        join public.lovely_pages page on page.id = reference.page_id
        where reference.image_id = image.id
          and page.owner_id = p_destination_user
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
