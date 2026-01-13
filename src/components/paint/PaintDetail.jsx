import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function PaintDetail({ item }) {
  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-lg font-semibold leading-snug">{item.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {item.brand ? item.brand : "ブランド未設定"}
                {item.color ? ` • ${item.color}` : ""}
              </div>
            </div>
            <div className="shrink-0">
              {item.type ? <Badge>{item.type}</Badge> : <Badge variant="secondary">type?</Badge>}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">容量</div>
              <div>{item.capacity || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">所持数</div>
              <div>{typeof item.qty === "number" ? item.qty : "-"}</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground">バーコード</div>
              <div className="break-all">{item.barcode || "-"}</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground">購入日</div>
              <div>{item.purchasedAt || "-"}</div>
            </div>
          </div>

          {item.note ? (
            <>
              <Separator />
              <div>
                <div className="text-xs text-muted-foreground">メモ</div>
                <div className="text-sm whitespace-pre-wrap">{item.note}</div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      {item.imageDataUrl ? (
        <Card>
          <CardContent className="p-3">
            <img src={item.imageDataUrl} className="w-full rounded-lg border border-border" />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
