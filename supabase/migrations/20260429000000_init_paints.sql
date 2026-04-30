-- =====================================================================
-- paints schema + Row Level Security
-- 2026-04-29 — initial migration for the rebuilt app
-- =====================================================================

create extension if not exists "pgcrypto";

create table if not exists public.paints (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,

  name            text not null check (length(name) between 1 and 200),
  brand           text check (brand is null or length(brand) <= 120),
  type            text check (type in ('paint','surfacer','clear','thinner','other')) default 'other',
  system          text check (system in ('unknown','lacquer','aqueous','enamel','acrylic','marker','other')) default 'unknown',
  color           text check (color is null or length(color) <= 60),
  note            text check (note is null or length(note) <= 4000),
  capacity        text check (capacity is null or length(capacity) <= 60),
  qty             integer check (qty is null or (qty >= 0 and qty <= 100000)),
  barcode         text check (barcode is null or barcode ~ '^[0-9A-Za-z\-]{4,32}$'),
  purchased_at    date,
  image_url       text check (image_url is null or length(image_url) <= 2048),
  image_data_url  text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists paints_user_updated_idx
  on public.paints (user_id, updated_at desc);
create index if not exists paints_user_barcode_idx
  on public.paints (user_id, barcode)
  where barcode is not null;

-- updated_at maintenance
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists paints_set_updated_at on public.paints;
create trigger paints_set_updated_at
  before update on public.paints
  for each row execute function public.tg_set_updated_at();

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.paints enable row level security;
alter table public.paints force row level security;

-- Per-user isolation. anon role gets nothing.
drop policy if exists paints_select_own on public.paints;
create policy paints_select_own on public.paints
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists paints_insert_own on public.paints;
create policy paints_insert_own on public.paints
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists paints_update_own on public.paints;
create policy paints_update_own on public.paints
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists paints_delete_own on public.paints;
create policy paints_delete_own on public.paints
  for delete to authenticated
  using (auth.uid() = user_id);

-- Defensive grants. Without RLS, these would still gate by policy.
revoke all on table public.paints from anon;
revoke all on table public.paints from public;
grant select, insert, update, delete on public.paints to authenticated;
