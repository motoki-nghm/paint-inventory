import { isLikelyJan } from "@/lib/validators";
import { loadState } from "@/lib/storage";

export interface ProductLookupResult {
  name: string;
  imageUrl: string;
  source: string;
}

function normalizeImageUrl(url: string | undefined): string {
  if (!url) return "";
  let u = String(url).trim();
  if (!u) return "";
  if (u.startsWith("//")) u = "https:" + u;
  if (u.startsWith("http://")) u = "https://" + u.slice(7);
  return u;
}

/**
 * Lookup priority:
 * 1) Local IDB (previously seen JAN)
 * 2) /api/yahoo-lookup
 */
export async function productLookup(
  barcode: string,
  signal?: AbortSignal,
): Promise<ProductLookupResult | null> {
  const code = String(barcode || "").trim();
  if (!code || !isLikelyJan(code)) return null;

  // 1) Local
  try {
    const state = await loadState();
    const hit = state.paints.find(
      (p) => String(p?.barcode ?? "").trim() === code,
    );
    if (hit?.name?.trim()) {
      return {
        name: hit.name.trim(),
        imageUrl: normalizeImageUrl(hit.imageUrl),
        source: "ローカル履歴",
      };
    }
  } catch {
    // ignore and fall through
  }

  // 2) Yahoo lookup via serverless proxy
  try {
    const res = await fetch(`/api/yahoo-lookup?barcode=${encodeURIComponent(code)}`, {
      signal,
      credentials: "omit",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as
      | { ok: true; found: true; name: string; imageUrl?: string; url?: string }
      | { ok: true; found: false }
      | { ok: false; error: string };

    if ("ok" in data && data.ok && "found" in data && data.found) {
      return {
        name: data.name || "",
        imageUrl: normalizeImageUrl(data.imageUrl),
        source: "Yahoo Shopping",
      };
    }
    return null;
  } catch {
    return null;
  }
}
