// Vercel Serverless Function — product lookup proxy (Yahoo + Rakuten).
//
// Tries providers in order:
//   1) Yahoo Shopping V3 — `jan_code` exact match (most accurate for JAN)
//   2) Rakuten Ichiba — `keyword` search (used as a fallback)
//
// Configure either or both via env:
//   YAHOO_APP_ID    — Yahoo! Developer Network appid
//   RAKUTEN_APP_ID  — Rakuten Web Service applicationId
//
// Hardening:
//   - GET only
//   - JAN regex validation (8 / 12 / 13 / 14 digits)
//   - Per-IP in-memory rate limit (best-effort)
//   - Hide upstream error bodies
//   - Cache-Control / X-Robots-Tag

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

interface YahooHit {
  name?: string;
  exImage?: { url?: string };
  image?: { medium?: string; small?: string };
  url?: string;
}
interface YahooResponse {
  hits?: YahooHit[];
}

interface RakutenItem {
  itemName?: string;
  mediumImageUrls?: Array<string | { imageUrl?: string }>;
  itemUrl?: string;
}
interface RakutenResponse {
  Items?: Array<{ Item?: RakutenItem } | RakutenItem>;
}

interface ProviderResult {
  name: string;
  imageUrl: string;
  url: string;
  source: string;
}

const JAN_RE = /^(\d{8}|\d{12}|\d{13}|\d{14})$/;

const buckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (b.count >= MAX_PER_WINDOW) return false;
  b.count += 1;
  return true;
}

function getClientIp(req: VercelRequest): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string") return fwd.split(",")[0]?.trim() ?? "anon";
  if (Array.isArray(fwd)) return (fwd[0] ?? "").split(",")[0]?.trim() ?? "anon";
  return "anon";
}

function singleQuery(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

function normalizeImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  let u = String(url).trim();
  if (!u) return "";
  if (u.startsWith("//")) u = "https:" + u;
  if (u.startsWith("http://")) u = "https://" + u.slice(7);
  return u;
}

async function lookupYahoo(jan: string, appid: string): Promise<ProviderResult | null> {
  const url = new URL("https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch");
  url.searchParams.set("appid", appid);
  url.searchParams.set("jan_code", jan);
  url.searchParams.set("results", "1");
  url.searchParams.set("image_size", "300");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(5_000),
  });
  if (!res.ok) throw new Error(`yahoo ${res.status}`);
  const data = (await res.json()) as YahooResponse;
  const hit = data.hits?.[0];
  if (!hit?.name) return null;

  return {
    name: hit.name,
    imageUrl: normalizeImageUrl(
      hit.exImage?.url ?? hit.image?.medium ?? hit.image?.small,
    ),
    url: hit.url ?? "",
    source: "Yahoo Shopping",
  };
}

async function lookupRakuten(jan: string, appid: string): Promise<ProviderResult | null> {
  const url = new URL("https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601");
  url.searchParams.set("applicationId", appid);
  url.searchParams.set("keyword", jan);
  url.searchParams.set("hits", "3");
  url.searchParams.set("formatVersion", "2");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(5_000),
  });
  if (!res.ok) throw new Error(`rakuten ${res.status}`);
  const data = (await res.json()) as RakutenResponse;

  const items = (data.Items ?? [])
    .map((i) => ("Item" in (i as object) ? (i as { Item: RakutenItem }).Item : (i as RakutenItem)))
    .filter((i): i is RakutenItem => !!i?.itemName);

  // Prefer hits whose name explicitly contains the JAN, when available.
  const best = items.find((i) => i.itemName!.includes(jan)) ?? items[0];
  if (!best?.itemName) return null;

  const firstImg = Array.isArray(best.mediumImageUrls) ? best.mediumImageUrls[0] : undefined;
  const imageUrl =
    typeof firstImg === "string"
      ? firstImg
      : (firstImg?.imageUrl ?? "");

  return {
    name: best.itemName,
    imageUrl: normalizeImageUrl(imageUrl),
    url: best.itemUrl ?? "",
    source: "楽天市場",
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "method not allowed" });
  }

  const ip = getClientIp(req);
  if (!rateLimit(ip)) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({ ok: false, error: "rate limited" });
  }

  const barcode = singleQuery(req.query.barcode).trim();
  if (!barcode) return res.status(400).json({ ok: false, error: "barcode is required" });
  if (!JAN_RE.test(barcode)) {
    return res.status(400).json({ ok: false, error: "invalid barcode format" });
  }

  const yahooKey = process.env.YAHOO_APP_ID;
  const rakutenKey = process.env.RAKUTEN_APP_ID;
  if (!yahooKey && !rakutenKey) {
    return res
      .status(503)
      .json({ ok: false, error: "no provider configured" });
  }

  const upstreamErrors: string[] = [];

  if (yahooKey) {
    try {
      const r = await lookupYahoo(barcode, yahooKey);
      if (r) {
        res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
        return res.status(200).json({ ok: true, found: true, ...r });
      }
    } catch (e) {
      upstreamErrors.push(e instanceof Error ? e.message : "yahoo error");
    }
  }

  if (rakutenKey) {
    try {
      const r = await lookupRakuten(barcode, rakutenKey);
      if (r) {
        res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
        return res.status(200).json({ ok: true, found: true, ...r });
      }
    } catch (e) {
      upstreamErrors.push(e instanceof Error ? e.message : "rakuten error");
    }
  }

  if (upstreamErrors.length > 0) {
    return res.status(502).json({ ok: false, error: "upstream error" });
  }

  res.setHeader("Cache-Control", "public, max-age=30");
  return res.status(200).json({ ok: true, found: false });
}
