import type { ToolCategory } from "@/types/tool";

export interface ToolCatalogEntry {
  id: string;
  source: "yahoo" | "rakuten" | "curated";
  sourceId: string;
  name: string;
  brand: string | null;
  category: ToolCategory;
  jan: string | null;
  imageUrl: string | null;
  productUrl: string | null;
  priceYen: number | null;
  lastSeenAt: string;
}
