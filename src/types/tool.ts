export const TOOL_CATEGORIES = [
  "nipper",
  "file",
  "tweezers",
  "decal",
  "cement",
  "panel_line",
  "masking",
  "airbrush",
  "polish",
  "other",
] as const;
export type ToolCategory = (typeof TOOL_CATEGORIES)[number];

export const TOOL_CATEGORY_LABELS: Record<ToolCategory, string> = {
  nipper: "ニッパー",
  file: "やすり/砥石",
  tweezers: "ピンセット",
  decal: "デカール用品",
  cement: "接着剤",
  panel_line: "墨入れ",
  masking: "マスキング",
  airbrush: "エアブラシ",
  polish: "研磨剤",
  other: "その他",
};

export const TOOL_CONDITIONS = ["new", "good", "worn", "retired"] as const;
export type ToolCondition = (typeof TOOL_CONDITIONS)[number];

export const TOOL_CONDITION_LABELS: Record<ToolCondition, string> = {
  new: "新品",
  good: "良好",
  worn: "消耗",
  retired: "引退",
};

export interface Tool {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  brand?: string;
  category: ToolCategory;
  condition: ToolCondition;
  qty?: number;
  location?: string;
  note?: string;
  purchasedAt?: string;
  imageUrl?: string;
  imageDataUrl?: string;
}

export type ToolDraft = Omit<Tool, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
  createdAt?: number;
  updatedAt?: number;
};

export interface ToolFilters {
  q: string;
  category: ToolCategory | "all";
  condition: ToolCondition | "all";
}

export const DEFAULT_TOOL_FILTERS: ToolFilters = {
  q: "",
  category: "all",
  condition: "all",
};
