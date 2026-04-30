import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  PAINT_SYSTEMS,
  PAINT_SYSTEM_LABELS,
  PAINT_TYPES,
  PAINT_TYPE_LABELS,
  type PaintFilters,
} from "@/types/paint";

interface FilterBarProps {
  filters: PaintFilters;
  brands: string[];
  onChange: (next: PaintFilters) => void;
}

export function FilterBar({ filters, brands, onChange }: FilterBarProps) {
  const hasFilter =
    filters.q !== "" ||
    filters.type !== "all" ||
    filters.brand !== "all" ||
    filters.system !== "all";

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="検索 (商品名 / メーカー / 色 / メモ / バーコード)"
          value={filters.q}
          onChange={(e) => onChange({ ...filters, q: e.target.value })}
          className="pl-9 pr-9"
          inputMode="search"
          enterKeyHint="search"
        />
        {filters.q ? (
          <button
            type="button"
            aria-label="検索クリア"
            onClick={() => onChange({ ...filters, q: "" })}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Select
          aria-label="種類で絞り込み"
          value={filters.type}
          onValueChange={(v) =>
            onChange({ ...filters, type: v as PaintFilters["type"] })
          }
          options={[
            { value: "all", label: "種類: すべて" },
            ...PAINT_TYPES.map((t) => ({ value: t, label: PAINT_TYPE_LABELS[t] })),
          ]}
        />
        <Select
          aria-label="メーカーで絞り込み"
          value={filters.brand}
          onValueChange={(v) => onChange({ ...filters, brand: v })}
          options={[
            { value: "all", label: "メーカー: すべて" },
            ...brands.map((b) => ({ value: b, label: b })),
          ]}
        />
        <Select
          aria-label="系統で絞り込み"
          value={filters.system}
          onValueChange={(v) =>
            onChange({ ...filters, system: v as PaintFilters["system"] })
          }
          options={[
            { value: "all", label: "系統: すべて" },
            ...PAINT_SYSTEMS.map((s) => ({
              value: s,
              label: PAINT_SYSTEM_LABELS[s],
            })),
          ]}
        />
      </div>
      {hasFilter ? (
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() =>
            onChange({ q: "", type: "all", brand: "all", system: "all" })
          }
        >
          フィルターをクリア
        </Button>
      ) : null}
    </div>
  );
}
