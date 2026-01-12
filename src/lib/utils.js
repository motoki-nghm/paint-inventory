export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function safeJsonParse(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid JSON" };
  }
}

export function now() {
  return Date.now();
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function contains(hay, needle) {
  if (!hay) return false;
  return hay.toLowerCase().includes(needle.toLowerCase());
}
