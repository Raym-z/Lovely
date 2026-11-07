-- Tracks meaningful user activity so abandoned anonymous guests can be
-- identified safely. Rows are written only by server code using the service
-- role key; RLS has no public policies.
create table if not exists public.lovely_user_activity (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lovely_user_activity_last_activity_idx
  on public.lovely_user_activity (last_activity_at);

alter table public.lovely_user_activity enable row level security;

-- No public policies: activity is recorded server-side with the service role.

-- One row per cleanup execution. Useful for auditing dry runs and deletions.
create table if not exists public.lovely_cleanup_runs (
  id uuid primary key default gen_random_uuid(),
  executed_at timestamptz not null default now(),
  dry_run boolean not null default true,
  examined integer not null default 0 check (examined >= 0),
  eligible integer not null default 0 check (eligible >= 0),
  deleted integer not null default 0 check (deleted >= 0),
  skipped_own_content integer not null default 0 check (skipped_own_content >= 0),
  skipped_active integer not null default 0 check (skipped_active >= 0),
  skipped_unverified integer not null default 0 check (skipped_unverified >= 0),
  skipped_transfer integer not null default 0 check (skipped_transfer >= 0),
  truncated boolean not null default false,
  errors jsonb not null default '[]'::jsonb,
  details jsonb not null default '[]'::jsonb
);

create index if not exists lovely_cleanup_runs_executed_at_idx
  on public.lovely_cleanup_runs (executed_at desc);

alter table public.lovely_cleanup_runs enable row level security;

-- No public policies: cleanup runs are written server-side only.

-- Speeds up "did this guest upload anything?" checks during cleanup.
create index if not exists lovely_images_uploaded_by_user_id_idx
  on public.lovely_images (uploaded_by_user_id);
