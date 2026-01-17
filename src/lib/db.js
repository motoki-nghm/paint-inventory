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
  { value: "yellow", label: "イエロー" },
  { value: "green", label: "グリーン" },
  { value: "brown", label: "ブラウン" },
  { value: "silver", label: "シルバー" },
  { value: "gold", label: "ゴールド" },
  { value: "clear", label: "クリア" },
  { value: "clearColor", label: "クリアーカラー" },
  { value: "fluorescent", label: "蛍光" },
];
