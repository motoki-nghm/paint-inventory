export const PAINT_TYPES = ["paint", "surfacer", "clear", "thinner", "other"];

export const PAINT_SYSTEMS = [
  "unknown", // 未設定
  "lacquer", // ラッカー
  "aqueous", // 水性
  "enamel", // エナメル
  "acrylic", // アクリル（溶剤系/水性混在があるなら別枠）
  "oil", // 油性（必要なら）
  "other",
];

export const PAINT_SYSTEM_LABELS = {
  unknown: "未設定",
  lacquer: "ラッカー",
  aqueous: "水性",
  enamel: "エナメル",
  acrylic: "アクリル",
  oil: "油性",
  other: "その他",
};

export const DEFAULT_FILTERS = {
  q: "",
  type: "all",
  brand: "all",
  system: "all",
};

export const COLOR_PRESETS = [
  "ホワイト",
  "ブラック",
  "グレー",
  "シルバー",
  "ガンメタ",
  "レッド",
  "ワインレッド",
  "ピンク",
  "オレンジ",
  "イエロー",
  "サンド",
  "ブラウン",
  "クリア",
  "クリアブルー",
  "クリアレッド",
  "グリーン",
  "オリーブ",
  "ライム",
  "ブルー",
  "ネイビー",
  "ライトブルー",
  "スカイブルー",
  "パープル",
  "バイオレット",
  "ゴールド",
  "カッパー",
  "ブロンズ",
];
