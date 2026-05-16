-- =====================================================================
-- tools schema + Row Level Security
-- 2026-05-16 — 工具・資材インベントリ (paints と並列の独立テーブル)
-- =====================================================================

create extension if not exists "pgcrypto";

create table if not exists public.tools (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,

  name            text not null check (length(name) between 1 and 200),
  brand           text check (brand is null or length(brand) <= 120),
  category        text check (category in (
                    'nipper','file','tweezers','decal','cement',
                    'panel_line','masking','airbrush','polish','other'
                  )) default 'other',
  condition       text check (condition in ('new','good','worn','retired')) default 'good',
  qty             integer check (qty is null or (qty >= 0 and qty <= 100000)),
  location        text check (location is null or length(location) <= 120),
  note            text check (note is null or length(note) <= 4000),
  purchased_at    date,
  image_url       text check (image_url is null or length(image_url) <= 2048),
  image_data_url  text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists tools_user_updated_idx
  on public.tools (user_id, updated_at desc);
create index if not exists tools_user_category_idx
  on public.tools (user_id, category);

-- updated_at maintenance — paints と同じトリガ関数を使い回す
drop trigger if exists tools_set_updated_at on public.tools;
create trigger tools_set_updated_at
  before update on public.tools
  for each row execute function public.tg_set_updated_at();

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.tools enable row level security;
alter table public.tools force row level security;

drop policy if exists tools_select_own on public.tools;
create policy tools_select_own on public.tools
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists tools_insert_own on public.tools;
create policy tools_insert_own on public.tools
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists tools_update_own on public.tools;
create policy tools_update_own on public.tools
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists tools_delete_own on public.tools;
create policy tools_delete_own on public.tools
  for delete to authenticated
  using (auth.uid() = user_id);

revoke all on table public.tools from anon;
revoke all on table public.tools from public;
grant select, insert, update, delete on public.tools to authenticated;
