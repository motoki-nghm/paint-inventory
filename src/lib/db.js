export const PAINT_TYPES = ["paint", "surfacer", "clear", "thinner", "other"];

export const PAINT_SYSTEMS = [
  "unknown", // 未設定
  "lacquer", // ラッカー
  "aqueous", // 水性
  "enamel", // エナメル
  "acrylic", // アクリル
  "marker", // マーカー
  "other",
];

export const PAINT_SYSTEM_LABELS = {
  unknown: "未設定",
  lacquer: "ラッカー",
  aqueous: "水性",
  enamel: "エナメル",
  marker: "マーカー",
  other: "その他",
};

export const DEFAULT_FILTERS = {
  q: "",
  type: "all",
  brand: "all",
  system: "all",
};

export const COLOR_PRESETS = [
  { value: "white", label: "ホワイト" },
  { value: "black", label: "ブラック" },
  { value: "gray", label: "グレー" },
  { value: "red", label: "レッド" },
  { value: "pink", label: "ピンク" },
  { value: "blue", label: "ブルー" },
  { value: "navy", label: "ネイビー" },
  { value: "yellow", label: "イエロー" },
  { value: "green", label: "グリーン" },
  { value: "orange", label: "オレンジ" },
  { value: "brown", label: "ブラウン" },
  { value: "silver", label: "シルバー" },
  { value: "gunmetal", label: "ガンメタ" },
  { value: "gold", label: "ゴールド" },
  { value: "clear", label: "クリア" },
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

export function colorLabel(value) {
  const v = String(value ?? "").trim();
  if (!v) return "未設定";
  const hit = COLOR_PRESETS.find((c) => c.value === v);
  return hit ? hit.label : v; // ←プリセット外は手入力文字列をそのまま表示
}

export function isPresetColor(value) {
  const v = String(value ?? "").trim();
  return COLOR_PRESETS.some((c) => c.value === v);
}
