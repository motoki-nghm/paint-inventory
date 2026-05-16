import { Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { Container } from "@/components/layout/container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ToolFilterBar } from "@/components/tool/tool-filter-bar";
import { ToolList } from "@/components/tool/tool-list";
import { useFilteredTools, useToolsStore } from "@/stores/tools-store";
import { useEffect } from "react";

export function ToolsListPage() {
  const initialize = useToolsStore((s) => s.initialize);
  const filtered = useFilteredTools();
  const filters = useToolsStore((s) => s.filters);
  const setFilters = useToolsStore((s) => s.setFilters);
  const loaded = useToolsStore((s) => s.loaded);
  const totalCount = useToolsStore((s) => s.tools.length);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <Container className="space-y-3">
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-baseline justify-between">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              工具数
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {totalCount}
              <span className="ml-1 text-xs font-normal text-muted-foreground">件</span>
            </div>
          </div>
          <ToolFilterBar filters={filters} onChange={setFilters} />
        </CardContent>
      </Card>

      {!loaded ? (
        <ListSkeleton />
      ) : totalCount === 0 ? (
        <EmptyState
          icon={Wrench}
          title="工具がまだ登録されていません"
          description="ニッパー・ピンセット・デカール用品などを記録できます"
          action={
            <Link to="/tools/add">
              <Button>工具を追加</Button>
            </Link>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="該当する工具がありません"
          description="検索条件・フィルターを見直してください"
        />
      ) : (
        <ToolList items={filtered} />
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
