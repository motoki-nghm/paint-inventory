import { Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import { Container } from "@/components/layout/container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/paint/filter-bar";
import { PaintList } from "@/components/paint/paint-list";
import {
  useBrands,
  useFilteredPaints,
  usePaintsStore,
} from "@/stores/paints-store";
import type { GroupBy } from "@/types/paint";

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: "type", label: "種類" },
  { value: "color", label: "色" },
  { value: "brand", label: "メーカー" },
];

export function ListPage() {
  const filtered = useFilteredPaints();
  const brands = useBrands();
  const filters = usePaintsStore((s) => s.filters);
  const setFilters = usePaintsStore((s) => s.setFilters);
  const groupBy = usePaintsStore((s) => s.groupBy);
  const setGroupBy = usePaintsStore((s) => s.setGroupBy);
  const loaded = usePaintsStore((s) => s.loaded);
  const totalCount = usePaintsStore((s) => s.paints.length);

  return (
    <Container className="space-y-3">
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-baseline justify-between">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              登録数
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {totalCount}
              <span className="ml-1 text-xs font-normal text-muted-foreground">件</span>
            </div>
          </div>
          <FilterBar filters={filters} brands={brands} onChange={setFilters} />
          <div className="space-y-1.5">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              グルーピング
            </div>
            <div className="grid grid-cols-3 gap-2">
              {GROUP_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={groupBy === opt.value ? "default" : "secondary"}
                  size="sm"
                  className="w-full"
                  onClick={() => setGroupBy(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {!loaded ? (
        <ListSkeleton />
      ) : totalCount === 0 ? (
        <EmptyState
          icon={Inbox}
          title="塗料がまだ登録されていません"
          description="バーコードスキャンや手入力で追加できます"
          action={
            <div className="flex justify-center gap-2">
              <Link to="/add">
                <Button>手入力で追加</Button>
              </Link>
              <Link to="/scan">
                <Button variant="secondary">スキャン</Button>
              </Link>
            </div>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="該当する塗料がありません"
          description="検索条件・フィルターを見直してください"
        />
      ) : (
        <PaintList items={filtered} groupBy={groupBy} />
      )}
    </Container>
  );
}

function ListSkeleton() {
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
