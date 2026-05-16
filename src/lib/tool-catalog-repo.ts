import { supabase } from "@/lib/supabase";
import type { ToolCatalogEntry } from "@/types/tool-catalog";
import type { ToolCategory } from "@/types/tool";

interface CatalogRow {
  id: string;
  source: "yahoo" | "rakuten" | "curated";
  source_id: string;
  name: string;
  brand: string | null;
  category: string | null;
  jan: string | null;
  image_url: string | null;
  product_url: string | null;
  price_yen: number | null;
  last_seen_at: string;
}

function fromRow(r: CatalogRow): ToolCatalogEntry {
  return {
    id: r.id,
    source: r.source,
    sourceId: r.source_id,
    name: r.name,
    brand: r.brand,
    category: (r.category ?? "other") as ToolCategory,
    jan: r.jan,
    imageUrl: r.image_url,
    productUrl: r.product_url,
    priceYen: r.price_yen,
    lastSeenAt: r.last_seen_at,
  };
}

interface SearchOptions {
  q?: string;
  category?: ToolCategory | "all";
  limit?: number;
}

export async function searchToolCatalog(
  opts: SearchOptions = {},
): Promise<ToolCatalogEntry[]> {
  const limit = Math.min(opts.limit ?? 60, 200);
  let query = supabase
    .from("tool_catalog")
    .select(
      "id,source,source_id,name,brand,category,jan,image_url,product_url,price_yen,last_seen_at",
    )
    .eq("is_active", true)
    .order("last_seen_at", { ascending: false })
    .limit(limit);

  if (opts.category && opts.category !== "all") {
    query = query.eq("category", opts.category);
  }

  const q = (opts.q ?? "").trim();
  if (q) {
    // pg_trgm GIN インデックスを使った部分一致
    query = query.ilike("name", `%${q}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((r) => fromRow(r as CatalogRow));
}
