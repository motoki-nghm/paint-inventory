import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// 検索用：needleLower は呼び出し側で toLowerCase() 済み想定
export function contains(haystack, needleLower) {
  if (!needleLower) return true;
  const s = String(haystack ?? "").toLowerCase();
  return s.includes(String(needleLower));
}

export function now() {
  return Date.now();
}

export function clamp(n, min, max) {
  const x = Number(n);
  if (Number.isNaN(x)) return min;
  return Math.min(max, Math.max(min, x));
}

export function safeJsonParse(text) {
  try {
    return { ok: true, value: JSON.parse(text), error: null };
  } catch (e) {
    return { ok: false, value: null, error: e?.message || "parse error" };
  }
}
