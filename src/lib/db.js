// src/lib/db.js
export const PAINT_TYPES = ["paint", "surfacer", "clear", "thinner", "other"];

export const PAINT_SYSTEMS = ["unknown", "lacquer", "aqueous", "enamel", "acrylic", "marker", "other"];

export const PAINT_SYSTEM_LABELS = {
  unknown: "未設定",
  lacquer: "ラッカー",
  aqueous: "水性",
  enamel: "エナメル",
  acrylic: "アクリル",
  marker: "マーカー",
  other: "その他",
};

export const DEFAULT_FILTERS = {
  q: "",
  type: "all",
  brand: "all",
  system: "all",
};

// ✅ 空/未設定は white じゃなく unknown
export const DEFAULT_COLOR = "unknown";

export const COLOR_PRESETS = [
  { value: "unknown", label: "未設定" },
  { value: "white", label: "ホワイト" },
  { value: "black", label: "ブラック" },
  { value: "gray", label: "グレー" },
  { value: "red", label: "レッド" },
  { value: "pink", label: "ピンク" },
  { value: "blue", label: "ブルー" },
  { value: "navy", label: "ネイビー" },
  { value: "purple", label: "パープル" },
  { value: "yellow", label: "イエロー" },
  { value: "green", label: "グリーン" },
  { value: "orange", label: "オレンジ" },
  { value: "brown", label: "ブラウン" },
  { value: "silver", label: "シルバー" },
  { value: "gunmetal", label: "ガンメタ" },
  { value: "gold", label: "ゴールド" },
  { value: "clear", label: "クリア" },

  // ✅ キャメルケースも “プリセット” として扱えるようにする
  { value: "clearColor", label: "クリアカラー" },
  { value: "fluorescentRed", label: "蛍光レッド" },
  { value: "fluorescentPink", label: "蛍光ピンク" },
  { value: "fluorescentOrange", label: "蛍光オレンジ" },
  { value: "fluorescentYellow", label: "蛍光イエロー" },
  { value: "fluorescentGreen", label: "蛍光グリーン" },
  { value: "fluorescentBlue", label: "蛍光ブルー" },
  { value: "metallicRed", label: "メタリックレッド" },
  { value: "metallicBlue", label: "メタリックブルー" },
  { value: "metallicGreen", label: "メタリックグリーン" },
];

// ---- ここが重要：大小文字・キャメルケースも“同じキー”扱いにする ----
const VALUE_CANON = new Map(COLOR_PRESETS.map((c) => [String(c.value).trim().toLowerCase(), c.value]));

const LABEL_TO_VALUE = new Map(COLOR_PRESETS.map((c) => [String(c.label).trim().toLowerCase(), c.value]));

export function isPresetColor(v) {
  const key = String(v ?? "")
    .trim()
    .toLowerCase();
  return VALUE_CANON.has(key);
}

export function normalizeColor(v) {
  const raw = String(v ?? "").trim();
  if (!raw) return DEFAULT_COLOR;

  const key = raw.toLowerCase();

  // value一致（大小/キャメル差異を吸収）
  const canon = VALUE_CANON.get(key);
  if (canon) return canon;

  // label一致（「ホワイト」→ white）
  const mapped = LABEL_TO_VALUE.get(key);
  if (mapped) return mapped;

  // プリセット外はそのまま（手入力色）
  return raw;
}

export function colorLabel(v) {
  const canon = normalizeColor(v);
  const hit = COLOR_PRESETS.find((c) => c.value === canon);
  return hit?.label ?? (canon ? canon : "未設定");
}
