import { useState } from "react";
import Container from "@/components/layout/Container";
import FilterBar from "@/components/paint/FilterBar";
import PaintList from "@/components/paint/PaintList";
import { usePaints } from "@/lib/PaintsProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "../components/ui/button";

export default function ListPage() {
  const { filtered, filters, setFilters, brands, loaded, paints } = usePaints();
  const [groupBy, setGroupBy] = useState("type"); // type | color | brand

  return (
    <Container className="space-y-3">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="text-sm text-muted-foreground">
            登録数：<span className="font-semibold text-[rgb(var(--fg))]">{paints.length}</span>
          </div>
          <FilterBar filters={filters} brands={brands} onChange={setFilters} />
          <div className="pt-1">
            {" "}
            <div className="text-xs text-muted-foreground mb-2">グルーピング</div>{" "}
            <div className="grid grid-cols-3 gap-2">
              {" "}
              <Button
                variant={groupBy === "type" ? "default" : "secondary"}
                className="w-full"
                onClick={() => setGroupBy("type")}
              >
                {" "}
                種類{" "}
              </Button>{" "}
              <Button
                variant={groupBy === "color" ? "default" : "secondary"}
                className="w-full"
                onClick={() => setGroupBy("color")}
              >
                {" "}
                色{" "}
              </Button>{" "}
              <Button
                variant={groupBy === "brand" ? "default" : "secondary"}
                className="w-full"
                onClick={() => setGroupBy("brand")}
              >
                {" "}
                メーカー{" "}
              </Button>{" "}
            </div>{" "}
          </div>
        </CardContent>
      </Card>

      {!loaded ? (
        <div className="text-sm text-muted-foreground">読み込み中…</div>
      ) : (
        <PaintList items={filtered} groupBy={groupBy} />
      )}
    </Container>
  );
}
