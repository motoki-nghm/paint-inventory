// Vercel Cron — 工具カタログ更新ジョブ
//
// 1日 1〜複数回 Vercel cron から叩かれて、Yahoo!ショッピング/楽天市場 から
// 模型工具をキーワード検索 → 正規化 → Supabase tool_catalog テーブルへ upsert する。
//
// Required env (Vercel Project Settings):
//   YAHOO_APP_ID                — Yahoo! Developer Network appid
//   RAKUTEN_APP_ID              — Rakuten Web Service applicationId  (任意 / Yahoo の補完)
//   SUPABASE_URL                — プロジェクト URL
//   SUPABASE_SERVICE_ROLE_KEY   — service_role (RLS をバイパスして書き込み)
//   CRON_SECRET                 — Vercel cron が自動で Bearer 付与 (任意, セット推奨)
//
// Vercel Hobby の 10s 実行制限を考慮し、?group=cutter のようにグループ単位で呼ぶ前提。
// vercel.json で複数の cron path に分けて登録する。

import { createClient } from "@supabase/supabase-js";

interface VercelRequest {
  method?: string;
  url?: string;
  query: Record<string, string | string[] | undefined>;
  headers: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  setHeader: (k: string, v: string) => VercelResponse;
  json: (body: unknown) => void;
  end: () => void;
}

// -----------------------------------------------------------------------------
// キーワード辞書 (グループ → カテゴリ → クエリ群)
// -----------------------------------------------------------------------------
type ToolCategory =
  | "nipper"
  | "file"
  | "tweezers"
  | "decal"
  | "cement"
  | "panel_line"
  | "masking"
  | "airbrush"
  | "polish"
  | "other";

interface KeywordSpec {
  category: ToolCategory;
  queries: string[];
}

// グループは Vercel cron の path で指定。10s 制限内に収まるよう 1グループ = 数語に絞る。
const GROUPS: Record<string, KeywordSpec[]> = {
  cutter: [
    { category: "nipper", queries: ["ニッパー 模型", "ゲートカット ニッパー"] },
    { category: "cement", queries: ["プラモデル 接着剤", "流し込み 接着剤"] },
  ],
  abrasive: [
    { category: "file", queries: ["ヤスリ 模型", "スポンジヤスリ"] },
    { category: "polish", queries: ["研磨 模型", "コンパウンド 模型"] },
  ],
  detail: [
    { category: "tweezers", queries: ["精密ピンセット 模型"] },
    { category: "panel_line", queries: ["スミ入れ", "墨入れペン 模型"] },
    { category: "decal", queries: ["デカール 軟化剤", "マークセッター"] },
  ],
  paint: [
    { category: "masking", queries: ["マスキングテープ 模型"] },
    { category: "airbrush", queries: ["エアブラシ ハンドピース", "エアブラシ コンプレッサー"] },
  ],
};

// 商品名 → カテゴリ推定 (検索キーワードと混在を防ぐためのフォールバック)
function refineCategory(name: string, fallback: ToolCategory): ToolCategory {
  const n = name.toLowerCase();
  if (/ニッパー|nipper/.test(name)) return "nipper";
  if (/ヤスリ|やすり|サンディング|sand/.test(n)) return "file";
  if (/ピンセット|tweezer/.test(n)) return "tweezers";
  if (/デカール|マークセッター|マークソフター|decal/.test(n)) return "decal";
  if (/接着剤|セメント|cement|glue/.test(n)) return "cement";
  if (/スミ入れ|墨入れ|スミイレ|panel.?line/.test(n)) return "panel_line";
  if (/マスキング|masking/.test(n)) return "masking";
  if (/エアブラシ|airbrush|コンプレッサー|ハンドピース/.test(n)) return "airbrush";
  if (/コンパウンド|研磨|polish|バフ/.test(n)) return "polish";
  return fallback;
}

// 商品名からブランドを推定
const BRAND_HINTS: Array<[RegExp, string]> = [
  [/ゴッドハンド|GodHand|GOD\s?HAND/i, "GodHand"],
  [/タミヤ|TAMIYA/i, "TAMIYA"],
  [/ガイアノーツ|ガイアカラー|GAIA/i, "Gaianotes"],
  [/Mr\.?\s?HOBBY|GSI クレオス|GSI クリエイト|MR\.HOBBY/i, "GSI Creos"],
  [/ハセガワ|HASEGAWA/i, "Hasegawa"],
  [/WAVE|ウェーブ/i, "WAVE"],
  [/プラッツ|PLATZ/i, "PLATZ"],
  [/フィニッシャーズ|Finisher/i, "Finisher's"],
  [/トラスコ|TRUSCO/i, "TRUSCO"],
  [/プロクソン|PROXXON/i, "PROXXON"],
];

function refineBrand(name: string): string | null {
  for (const [re, brand] of BRAND_HINTS) {
    if (re.test(name)) return brand;
  }
  return null;
}

// 商品名から JAN を抽出 (8 / 12-14 桁)
function extractJan(name: string): string | null {
  const m = name.match(/\b(\d{8}|\d{12,14})\b/);
  return m ? m[1] : null;
}

// -----------------------------------------------------------------------------
// Yahoo / 楽天 API クライアント
// -----------------------------------------------------------------------------
interface YahooHit {
  name?: string;
  exImage?: { url?: string };
  image?: { medium?: string; small?: string };
  url?: string;
  janCode?: string;
  jan_code?: string;
  price?: number;
  brand?: { name?: string };
}
interface YahooResponse { hits?: YahooHit[] }

interface RakutenItem {
  itemName?: string;
  itemCode?: string;
  mediumImageUrls?: Array<string | { imageUrl?: string }>;
  itemUrl?: string;
  itemPrice?: number;
  shopName?: string;
}
interface RakutenResponse {
  Items?: Array<{ Item?: RakutenItem } | RakutenItem>;
}

type RawHit = {
  source: "yahoo" | "rakuten";
  source_id: string;
  name: string;
  brand: string | null;
  jan: string | null;
  image_url: string | null;
  product_url: string | null;
  price_yen: number | null;
};

function normalizeImageUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  let u = String(url).trim();
  if (!u) return null;
  if (u.startsWith("//")) u = "https:" + u;
  if (u.startsWith("http://")) u = "https://" + u.slice(7);
  if (u.length > 2048) return null;
  return u;
}

async function fetchYahoo(
  query: string,
  appid: string,
  hits = 20,
): Promise<RawHit[]> {
  const url = new URL("https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch");
  url.searchParams.set("appid", appid);
  url.searchParams.set("query", query);
  url.searchParams.set("results", String(hits));
  url.searchParams.set("image_size", "300");
  url.searchParams.set("sort", "-review_count");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(5_000),
  });
  if (!res.ok) throw new Error(`yahoo ${res.status}`);
  const data = (await res.json()) as YahooResponse;

  return (data.hits ?? [])
    .map((h, i): RawHit | null => {
      if (!h?.name) return null;
      const id = h.janCode ?? h.jan_code ?? `${query}-${i}`;
      return {
        source: "yahoo",
        source_id: id,
        name: h.name.trim(),
        brand: h.brand?.name?.trim() ?? null,
        jan: h.janCode ?? h.jan_code ?? extractJan(h.name),
        image_url: normalizeImageUrl(
          h.exImage?.url ?? h.image?.medium ?? h.image?.small,
        ),
        product_url: h.url ?? null,
        price_yen: typeof h.price === "number" ? h.price : null,
      };
    })
    .filter((x): x is RawHit => x !== null);
}

async function fetchRakuten(
  query: string,
  appid: string,
  hits = 20,
): Promise<RawHit[]> {
  const url = new URL("https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601");
  url.searchParams.set("applicationId", appid);
  url.searchParams.set("keyword", query);
  url.searchParams.set("hits", String(hits));
  url.searchParams.set("formatVersion", "2");
  url.searchParams.set("sort", "-reviewCount");
  url.searchParams.set("imageFlag", "1");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(5_000),
  });
  if (!res.ok) throw new Error(`rakuten ${res.status}`);
  const data = (await res.json()) as RakutenResponse;

  const items = (data.Items ?? [])
    .map((i) => ("Item" in (i as object) ? (i as { Item: RakutenItem }).Item : (i as RakutenItem)))
    .filter((i): i is RakutenItem => !!i?.itemName);

  return items
    .map((it, i): RawHit | null => {
      const name = it.itemName!.trim();
      const firstImg = Array.isArray(it.mediumImageUrls) ? it.mediumImageUrls[0] : undefined;
      const imageUrl =
        typeof firstImg === "string" ? firstImg : firstImg?.imageUrl ?? null;
      return {
        source: "rakuten",
        source_id: it.itemCode ?? `${query}-${i}`,
        name,
        brand: it.shopName?.trim() ?? null,
        jan: extractJan(name),
        image_url: normalizeImageUrl(imageUrl),
        product_url: it.itemUrl ?? null,
        price_yen: typeof it.itemPrice === "number" ? it.itemPrice : null,
      };
    })
    .filter((x): x is RawHit => x !== null);
}

// -----------------------------------------------------------------------------
// Upsert
// -----------------------------------------------------------------------------
interface UpsertRow {
  source: "yahoo" | "rakuten";
  source_id: string;
  name: string;
  brand: string | null;
  category: ToolCategory;
  jan: string | null;
  image_url: string | null;
  product_url: string | null;
  price_yen: number | null;
  search_keywords: string;
  last_seen_at: string;
  is_active: true;
}

function normalizeHit(hit: RawHit, category: ToolCategory, query: string): UpsertRow {
  return {
    source: hit.source,
    source_id: hit.source_id,
    name: hit.name,
    brand: hit.brand ?? refineBrand(hit.name),
    category: refineCategory(hit.name, category),
    jan: hit.jan,
    image_url: hit.image_url,
    product_url: hit.product_url,
    price_yen: hit.price_yen,
    search_keywords: query,
    last_seen_at: new Date().toISOString(),
    is_active: true,
  };
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------
function singleQuery(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel cron も GET で叩く
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "method not allowed" });
  }

  // CRON_SECRET があれば Bearer 認証 (Vercel cron は自動で付与)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers["authorization"];
    const header = Array.isArray(auth) ? auth[0] : auth;
    if (header !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }
  }

  const groupKey = singleQuery(req.query.group) || "cutter";
  const specs = GROUPS[groupKey];
  if (!specs) {
    return res.status(400).json({
      ok: false,
      error: `unknown group: ${groupKey}`,
      available: Object.keys(GROUPS),
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(503).json({ ok: false, error: "supabase not configured" });
  }

  const yahooKey = process.env.YAHOO_APP_ID;
  const rakutenKey = process.env.RAKUTEN_APP_ID;
  if (!yahooKey && !rakutenKey) {
    return res.status(503).json({ ok: false, error: "no provider configured" });
  }

  const sb = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 同一 (source, source_id) は最新 hit で上書き
  const dedup = new Map<string, UpsertRow>();
  const errors: string[] = [];
  let yahooCount = 0;
  let rakutenCount = 0;

  for (const spec of specs) {
    for (const q of spec.queries) {
      if (yahooKey) {
        try {
          const hits = await fetchYahoo(q, yahooKey, 20);
          yahooCount += hits.length;
          for (const h of hits) {
            const row = normalizeHit(h, spec.category, q);
            dedup.set(`${row.source}:${row.source_id}`, row);
          }
        } catch (e) {
          errors.push(`yahoo[${q}]: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
      if (rakutenKey) {
        try {
          const hits = await fetchRakuten(q, rakutenKey, 20);
          rakutenCount += hits.length;
          for (const h of hits) {
            const row = normalizeHit(h, spec.category, q);
            dedup.set(`${row.source}:${row.source_id}`, row);
          }
        } catch (e) {
          errors.push(`rakuten[${q}]: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    }
  }

  const rows = Array.from(dedup.values());
  let upserted = 0;
  // バッチで upsert (1リクエスト上限を考慮し 100 件ずつ)
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    const { error } = await sb
      .from("tool_catalog")
      .upsert(chunk, { onConflict: "source,source_id", ignoreDuplicates: false });
    if (error) {
      errors.push(`upsert[${i}]: ${error.message}`);
      continue;
    }
    upserted += chunk.length;
  }

  res.setHeader("Cache-Control", "no-store");
  return res.status(errors.length > 0 && upserted === 0 ? 502 : 200).json({
    ok: errors.length === 0 || upserted > 0,
    group: groupKey,
    queries: specs.flatMap((s) => s.queries),
    fetched: { yahoo: yahooCount, rakuten: rakutenCount },
    deduped: rows.length,
    upserted,
    errors,
  });
}
