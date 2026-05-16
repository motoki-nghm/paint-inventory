-- =====================================================================
-- tool_catalog schema + Row Level Security
-- 2026-05-16 — Yahoo!/楽天 から定期収集する工具カタログ (全ユーザー共有)
--
-- 書き込みは Vercel cron からのみ (service_role)
-- 読み取りは認証済みユーザー全員に許可
-- =====================================================================

create extension if not exists "pgcrypto";
-- pg_trgm: 部分一致検索用 GIN インデックス。Supabase では拡張のみ提供で
-- デフォルト無効なので、インデックス作成より先に enable しておく。
create extension if not exists pg_trgm;

create table if not exists public.tool_catalog (
  id              uuid primary key default gen_random_uuid(),
  source          text not null check (source in ('yahoo','rakuten','curated')),
  source_id       text not null,                       -- provider 側の商品コード or JAN
  name            text not null check (length(name) between 1 and 400),
  brand           text check (brand is null or length(brand) <= 120),
  -- アプリ側 ToolCategory と同じ enum
  category        text check (category in (
                    'nipper','file','tweezers','decal','cement',
                    'panel_line','masking','airbrush','polish','other'
                  )) default 'other',
  jan             text check (jan is null or jan ~ '^[0-9]{8}$|^[0-9]{12,14}$'),
  image_url       text check (image_url is null or length(image_url) <= 2048),
  product_url     text check (product_url is null or length(product_url) <= 2048),
  price_yen       integer check (price_yen is null or (price_yen >= 0 and price_yen <= 10000000)),
  search_keywords text,                                -- 取込時の検索キーワード (デバッグ用)
  is_active       boolean not null default true,
  last_seen_at    timestamptz not null default now(),
  created_at      timestamptz not null default now(),

  unique (source, source_id)
);

-- 検索用インデックス
create index if not exists tool_catalog_category_active_idx
  on public.tool_catalog (category, is_active, last_seen_at desc);

-- 簡易全文検索 (pg_trgm による部分一致 ILIKE 用)
create index if not exists tool_catalog_name_trgm_idx
  on public.tool_catalog using gin (name gin_trgm_ops);

-- JAN で重複参照する用 (アプリ側 paints とのクロス参照)
create index if not exists tool_catalog_jan_idx
  on public.tool_catalog (jan) where jan is not null;

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.tool_catalog enable row level security;
alter table public.tool_catalog force row level security;

-- 認証ユーザーは全件読み取り可
drop policy if exists tool_catalog_select_all on public.tool_catalog;
create policy tool_catalog_select_all on public.tool_catalog
  for select to authenticated
  using (is_active = true);

-- 書き込みポリシーは作らない → service_role でのみ書き込み可能
-- (service_role は RLS をバイパスする)

revoke all on table public.tool_catalog from anon;
revoke all on table public.tool_catalog from public;
grant select on table public.tool_catalog to authenticated;
