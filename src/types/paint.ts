export const PAINT_TYPES = ["paint", "surfacer", "clear", "thinner", "other"] as const;
export type PaintType = (typeof PAINT_TYPES)[number];

export const PAINT_TYPE_LABELS: Record<PaintType, string> = {
  paint: "塗料",
  surfacer: "サフ",
  clear: "クリア",
  thinner: "溶剤",
  other: "その他",
};

export const PAINT_SYSTEMS = [
  "unknown",
  "lacquer",
  "aqueous",
  "enamel",
  "acrylic",
  "marker",
  "other",
] as const;
export type PaintSystem = (typeof PAINT_SYSTEMS)[number];

export const PAINT_SYSTEM_LABELS: Record<PaintSystem, string> = {
  unknown: "未設定",
  lacquer: "ラッカー",
  aqueous: "水性",
  enamel: "エナメル",
  acrylic: "アクリル",
  marker: "マーカー",
  other: "その他",
};

export interface ColorPreset {
  value: string;
  label: string;
  /** rgb hex used as a swatch hint */
  swatch: string;
}

export const COLOR_PRESETS: readonly ColorPreset[] = [
  { value: "unknown", label: "未設定", swatch: "#3f3f46" },
  { value: "white", label: "ホワイト", swatch: "#f5f5f5" },
  { value: "black", label: "ブラック", swatch: "#0a0a0a" },
  { value: "gray", label: "グレー", swatch: "#71717a" },
  { value: "red", label: "レッド", swatch: "#dc2626" },
  { value: "pink", label: "ピンク", swatch: "#ec4899" },
  { value: "blue", label: "ブルー", swatch: "#2563eb" },
  { value: "navy", label: "ネイビー", swatch: "#1e3a8a" },
  { value: "purple", label: "パープル", swatch: "#9333ea" },
  { value: "yellow", label: "イエロー", swatch: "#eab308" },
  { value: "green", label: "グリーン", swatch: "#16a34a" },
  { value: "orange", label: "オレンジ", swatch: "#f97316" },
  { value: "brown", label: "ブラウン", swatch: "#92400e" },
  { value: "silver", label: "シルバー", swatch: "#cbd5e1" },
  { value: "gunmetal", label: "ガンメタ", swatch: "#374151" },
  { value: "gold", label: "ゴールド", swatch: "#ca8a04" },
  { value: "clear", label: "クリア", swatch: "#fafafa" },
  { value: "clearColor", label: "クリアカラー", swatch: "#a3a3a3" },
  { value: "fluorescentRed", label: "蛍光レッド", swatch: "#ef4444" },
  { value: "fluorescentPink", label: "蛍光ピンク", swatch: "#f472b6" },
  { value: "fluorescentOrange", label: "蛍光オレンジ", swatch: "#fb923c" },
  { value: "fluorescentYellow", label: "蛍光イエロー", swatch: "#fde047" },
  { value: "fluorescentGreen", label: "蛍光グリーン", swatch: "#4ade80" },
  { value: "fluorescentBlue", label: "蛍光ブルー", swatch: "#60a5fa" },
  { value: "metallicRed", label: "メタリックレッド", swatch: "#b91c1c" },
  { value: "metallicBlue", label: "メタリックブルー", swatch: "#1d4ed8" },
  { value: "metallicGreen", label: "メタリックグリーン", swatch: "#15803d" },
] as const;

export const DEFAULT_COLOR = "unknown";

export interface Paint {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  brand?: string;
  type: PaintType;
  system: PaintSystem;
  color: string;
  note?: string;
  capacity?: string;
  qty?: number;
  barcode?: string;
  purchasedAt?: string;
  imageUrl?: string;
  imageDataUrl?: string;
}

export type PaintDraft = Omit<Paint, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
  createdAt?: number;
  updatedAt?: number;
};

export interface PaintFilters {
  q: string;
  type: PaintType | "all";
  brand: string;
  system: PaintSystem | "all";
}

export const DEFAULT_FILTERS: PaintFilters = {
  q: "",
  type: "all",
  brand: "all",
  system: "all",
};

export type GroupBy = "type" | "color" | "brand";
