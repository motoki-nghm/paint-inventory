import Container from "@/components/layout/Container";
import FilterBar from "@/components/paint/FilterBar";
import PaintList from "@/components/paint/PaintList";
import { usePaints } from "@/lib/PaintsProvider";
import { Card, CardContent } from "@/components/ui/card";

export default function ListPage() {
  const { filtered, filters, setFilters, brands, loaded, paints } = usePaints();

  return (
    <Container className="space-y-3">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="text-sm text-[rgb(var(--muted-fg))]">
            登録数：<span className="font-semibold text-[rgb(var(--fg))]">{paints.length}</span>
          </div>
          <FilterBar filters={filters} brands={brands} onChange={setFilters} />
        </CardContent>
      </Card>

      {!loaded ? (
        <div className="text-sm text-[rgb(var(--muted-fg))]">読み込み中…</div>
      ) : (
        <PaintList items={filtered} />
      )}
    </Container>
  );
}
