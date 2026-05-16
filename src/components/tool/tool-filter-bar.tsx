import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  TOOL_CATEGORIES,
  TOOL_CATEGORY_LABELS,
  TOOL_CONDITIONS,
  TOOL_CONDITION_LABELS,
  type ToolFilters,
} from "@/types/tool";

interface ToolFilterBarProps {
  filters: ToolFilters;
  onChange: (next: ToolFilters) => void;
}

export function ToolFilterBar({ filters, onChange }: ToolFilterBarProps) {
  const hasFilter =
    filters.q !== "" ||
    filters.category !== "all" ||
    filters.condition !== "all";

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="検索 (名前 / メーカー / 保管場所 / メモ)"
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
      <div className="grid grid-cols-2 gap-2">
        <Select
          aria-label="カテゴリで絞り込み"
          value={filters.category}
          onValueChange={(v) =>
            onChange({ ...filters, category: v as ToolFilters["category"] })
          }
          options={[
            { value: "all", label: "カテゴリ: すべて" },
            ...TOOL_CATEGORIES.map((c) => ({
              value: c,
              label: TOOL_CATEGORY_LABELS[c],
            })),
          ]}
        />
        <Select
          aria-label="状態で絞り込み"
          value={filters.condition}
          onValueChange={(v) =>
            onChange({ ...filters, condition: v as ToolFilters["condition"] })
          }
          options={[
            { value: "all", label: "状態: すべて" },
            ...TOOL_CONDITIONS.map((c) => ({
              value: c,
              label: TOOL_CONDITION_LABELS[c],
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
            onChange({ q: "", category: "all", condition: "all" })
          }
        >
          フィルターをクリア
        </Button>
      ) : null}
    </div>
  );
}
