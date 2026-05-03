import { isLikelyJan } from "@/lib/validators";
import { loadState } from "@/lib/storage";

export type LookupOutcome =
  | {
      kind: "found";
      name: string;
      imageUrl: string;
      source: string;
    }
  | { kind: "not_found" }
  | { kind: "invalid_barcode" }
  | { kind: "not_configured" }
  | { kind: "rate_limited" }
  | { kind: "upstream_error" }
  | { kind: "network_error"; message: string };

interface ApiSuccessFound {
  ok: true;
  found: true;
  name: string;
  imageUrl?: string;
  url?: string;
  source?: string;
}
interface ApiSuccessNotFound {
  ok: true;
  found: false;
}
interface ApiFailure {
  ok: false;
  error: string;
}
type ApiBody = ApiSuccessFound | ApiSuccessNotFound | ApiFailure;

function normalizeImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  let u = String(url).trim();
  if (!u) return "";
  if (u.startsWith("//")) u = "https:" + u;
  if (u.startsWith("http://")) u = "https://" + u.slice(7);
  return u;
}

/**
 * Lookup a product by barcode.
 *
 * Priority:
 *   1) Local IDB history (already-seen JAN)
 *   2) /api/product-lookup (Yahoo Shopping → Rakuten Ichiba fallback)
 *
 * Returns a discriminated outcome so callers can show specific UX
 * (e.g. "API 未設定", "ヒットなし", "通信失敗").
 */
export async function productLookup(
  barcode: string,
  signal?: AbortSignal,
): Promise<LookupOutcome> {
  const code = String(barcode || "").trim();
  if (!code) return { kind: "invalid_barcode" };
  if (!isLikelyJan(code)) return { kind: "invalid_barcode" };

  // 1) Local history
  try {
    const state = await loadState();
    const hit = state.paints.find(
      (p) => String(p?.barcode ?? "").trim() === code,
    );
    if (hit?.name?.trim()) {
      return {
        kind: "found",
        name: hit.name.trim(),
        imageUrl: normalizeImageUrl(hit.imageUrl),
        source: "ローカル履歴",
      };
    }
  } catch {
    // ignore IDB failures and try the network
  }

  // 2) Serverless multi-provider proxy
  try {
    const res = await fetch(
      `/api/product-lookup?barcode=${encodeURIComponent(code)}`,
      {
        signal,
        credentials: "omit",
        headers: { Accept: "application/json" },
      },
    );

    if (res.status === 503) return { kind: "not_configured" };
    if (res.status === 429) return { kind: "rate_limited" };

    if (!res.ok) {
      try {
        const body = (await res.json()) as ApiBody;
        if ("ok" in body && !body.ok && body.error === "no provider configured") {
          return { kind: "not_configured" };
        }
      } catch {
        // fall through
      }
      return { kind: "upstream_error" };
    }

    const data = (await res.json()) as ApiBody;

    if ("ok" in data && data.ok && "found" in data && data.found) {
      return {
        kind: "found",
        name: data.name || "",
        imageUrl: normalizeImageUrl(data.imageUrl),
        source: data.source || "external",
      };
    }
    if ("ok" in data && data.ok) return { kind: "not_found" };
    return { kind: "upstream_error" };
  } catch (e) {
    return {
      kind: "network_error",
      message: e instanceof Error ? e.message : "network error",
    };
  }
}
