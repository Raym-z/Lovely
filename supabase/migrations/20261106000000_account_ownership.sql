-- Adds optional account ownership to existing Lovely deployments.
-- Existing pages keep owner_id = null and remain accessible via edit keys.

alter table public.lovely_pages
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

create index if not exists lovely_pages_owner_id_idx
  on public.lovely_pages (owner_id);

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
