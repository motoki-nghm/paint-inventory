import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Image as ImageIcon, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { searchToolCatalog } from "@/lib/tool-catalog-repo";
import {
  TOOL_CATEGORIES,
  TOOL_CATEGORY_LABELS,
  type ToolCategory,
  type ToolDraft,
} from "@/types/tool";
import type { ToolCatalogEntry } from "@/types/tool-catalog";

interface ToolCatalogSearchProps {
  onBulkSubmit: (drafts: ToolDraft[]) => Promise<void> | void;
  submitting?: boolean;
}

export function ToolCatalogSearch({ onBulkSubmit, submitting }: ToolCatalogSearchProps) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<ToolCategory | "all">("all");
  const [results, setResults] = useState<ToolCatalogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const debounceRef = useRef<number | null>(null);

  const fetchNow = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await searchToolCatalog({ q, category, limit: 60 });
      setResults(list);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "検索に失敗しました";
      setError(msg);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [q, category]);

  // 入力デバウンス (250ms) + カテゴリ変更時は即時
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      void fetchNow();
    }, 250);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [fetchNow]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedEntries = useMemo(
    () => results.filter((r) => selected.has(r.id)),
    [results, selected],
  );

  const handleSubmit = async () => {
    if (selectedEntries.length === 0) return;
    const drafts: ToolDraft[] = selectedEntries.map((e) => ({
      name: e.name,
      brand: e.brand ?? undefined,
      category: e.category,
      condition: "new",
      qty: 1,
      imageUrl: e.imageUrl ?? undefined,
    }));
    await onBulkSubmit(drafts);
    setSelected(new Set());
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="relative">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="商品名で検索 (例: アルティメットニッパー)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 pr-9"
            inputMode="search"
            enterKeyHint="search"
          />
          {q ? (
            <button
              type="button"
              aria-label="検索クリア"
              onClick={() => setQ("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <Select
          aria-label="カテゴリで絞り込み"
          value={category}
          onValueChange={(v) => setCategory(v as ToolCategory | "all")}
          options={[
            { value: "all", label: "カテゴリ: すべて" },
            ...TOOL_CATEGORIES.map((c) => ({
              value: c,
              label: TOOL_CATEGORY_LABELS[c],
            })),
          ]}
        />
      </div>

      {selected.size > 0 ? (
        <div className="sticky top-0 z-10 -mx-1 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 backdrop-blur-md">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">
              {selected.size} 件を選択中
            </span>
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelected(new Set())}
              >
                解除
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "追加中…" : "まとめて追加"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <ResultSkeleton />
      ) : results.length === 0 ? (
        <EmptyState
          icon={Search}
          title={q ? "見つかりませんでした" : "カタログは毎日 3時(JST) に更新されます"}
          description={q ? "別のキーワードで検索してみてください" : "キーワードを入力するかカテゴリを選んでください"}
        />
      ) : (
        <div className="space-y-2">
          {results.map((r) => (
            <CatalogCard
              key={r.id}
              entry={r}
              selected={selected.has(r.id)}
              onToggle={() => toggle(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CatalogCard({
  entry,
  selected,
  onToggle,
}: {
  entry: ToolCatalogEntry;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <Card
      className={cn(
        "flex cursor-pointer gap-3 p-3 transition",
        selected
          ? "border-primary/60 bg-primary/10"
          : "hover:bg-accent/40",
      )}
      onClick={onToggle}
      role="button"
      aria-pressed={selected}
    >
      <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-muted">
        {entry.imageUrl ? (
          <img
            src={entry.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        ) : (
          <ImageIcon className="h-6 w-6 text-muted-foreground" aria-hidden />
        )}
        {selected ? (
          <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="line-clamp-2 text-sm font-semibold leading-snug">
          {entry.name}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          {entry.brand ? <span className="truncate">{entry.brand}</span> : null}
          {entry.priceYen != null ? (
            <>
              <span aria-hidden>·</span>
              <span className="font-medium text-foreground">
                ¥{entry.priceYen.toLocaleString()}
              </span>
            </>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">
            {TOOL_CATEGORY_LABELS[entry.category] ?? entry.category}
          </Badge>
          <Badge variant="outline" className="uppercase tracking-wide">
            {entry.source}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

function ResultSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-3">
          <div className="flex gap-3">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-2/5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
