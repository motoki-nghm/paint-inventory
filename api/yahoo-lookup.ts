// Vercel Serverless Function — Yahoo Shopping JAN code lookup proxy.
//
// Hardening (2026-04 standard):
//  - Strict input validation: barcode must be 8 / 12 / 13 / 14 digits
//  - GET only
//  - Hide upstream errors; never echo back unsanitized response bodies
//  - Aggressive cache headers per endpoint
//  - In-memory rate-limit per IP (best-effort; Vercel may run multiple instances)

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
  if (!barcode) {
    return res.status(400).json({ ok: false, error: "barcode is required" });
  }
  if (!JAN_RE.test(barcode)) {
    return res.status(400).json({ ok: false, error: "invalid barcode format" });
  }

  const appid = process.env.YAHOO_APP_ID;
  if (!appid) {
    return res
      .status(500)
      .json({ ok: false, error: "lookup is not configured" });
  }

  const url = new URL("https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch");
  url.searchParams.set("appid", appid);
  url.searchParams.set("jan_code", barcode);
  url.searchParams.set("results", "1");
  url.searchParams.set("image_size", "300");

  try {
    const upstream = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      // Vercel Edge / Node fetch supports AbortSignal.timeout in modern runtimes.
      signal: AbortSignal.timeout(5_000),
    });
    if (!upstream.ok) {
      return res.status(502).json({ ok: false, error: "upstream error" });
    }
    const data = (await upstream.json()) as YahooResponse;
    const hit = data.hits?.[0];

    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");

    if (!hit?.name) {
      return res.status(200).json({ ok: true, found: false });
    }

    return res.status(200).json({
      ok: true,
      found: true,
      name: hit.name,
      imageUrl: hit.exImage?.url || hit.image?.medium || hit.image?.small || "",
      url: hit.url ?? "",
    });
  } catch {
    // Never propagate raw upstream messages to the client.
    return res.status(502).json({ ok: false, error: "upstream error" });
  }
}
