import { COLOR_PRESETS, DEFAULT_COLOR } from "@/types/paint";

const VALUE_CANON = new Map(
  COLOR_PRESETS.map((c) => [String(c.value).trim().toLowerCase(), c.value]),
);
const LABEL_TO_VALUE = new Map(
  COLOR_PRESETS.map((c) => [String(c.label).trim().toLowerCase(), c.value]),
);
const SWATCH_BY_VALUE = new Map(COLOR_PRESETS.map((c) => [c.value, c.swatch]));

export function isPresetColor(v: unknown) {
  const key = String(v ?? "").trim().toLowerCase();
  return VALUE_CANON.has(key);
}

export function normalizeColor(v: unknown) {
  const raw = String(v ?? "").trim();
  if (!raw) return DEFAULT_COLOR;

  const key = raw.toLowerCase();
  const canon = VALUE_CANON.get(key);
  if (canon) return canon;

  const mapped = LABEL_TO_VALUE.get(key);
  if (mapped) return mapped;

  return raw;
}

export function colorLabel(v: unknown) {
  const canon = normalizeColor(v);
  const hit = COLOR_PRESETS.find((c) => c.value === canon);
  return hit?.label ?? (canon ? canon : "未設定");
}

export function colorSwatch(v: unknown): string {
  const canon = normalizeColor(v);
  return SWATCH_BY_VALUE.get(canon) ?? "#52525b";
}
