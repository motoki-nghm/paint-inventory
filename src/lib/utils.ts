import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function contains(haystack: unknown, needleLower: string) {
  if (!needleLower) return true;
  const s = String(haystack ?? "").toLowerCase();
  return s.includes(needleLower);
}

export function now() {
  return Date.now();
}

export function clamp(n: unknown, min: number, max: number) {
  const x = Number(n);
  if (Number.isNaN(x)) return min;
  return Math.min(max, Math.max(min, x));
}

export function safeJsonParse<T = unknown>(text: string):
  | { ok: true; value: T; error: null }
  | { ok: false; value: null; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) as T, error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "parse error";
    return { ok: false, value: null, error: msg };
  }
}

export function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // RFC4122 v4 fallback
  const r = () =>
    Math.floor(Math.random() * 0x100000000)
      .toString(16)
      .padStart(8, "0");
  return `${r()}${r().slice(0, 4)}-4${r().slice(0, 3)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${r().slice(0, 3)}-${r()}${r().slice(0, 4)}`;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(v: unknown) {
  return typeof v === "string" && UUID_RE.test(v);
}

export function formatRelative(ts: number, locale = "ja-JP") {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "たった今";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}分前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}時間前`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}日前`;
  return new Date(ts).toLocaleDateString(locale);
}
