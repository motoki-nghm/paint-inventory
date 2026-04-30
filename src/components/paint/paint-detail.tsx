import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ColorSwatch } from "@/components/paint/color-swatch";
import { colorLabel } from "@/lib/color";
import { formatRelative } from "@/lib/utils";
import { PAINT_SYSTEM_LABELS, PAINT_TYPE_LABELS, type Paint } from "@/types/paint";

export function PaintDetail({ item }: { item: Paint }) {
  const src = item.imageDataUrl || item.imageUrl;

  return (
    <div className="space-y-3">
      {src ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <img
            src={src}
            alt={item.name}
            referrerPolicy="no-referrer"
            className="block w-full"
          />
        </div>
      ) : null}

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="text-lg font-semibold leading-snug">{item.name}</div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{item.brand || "メーカー未設定"}</span>
                <span aria-hidden>·</span>
                <ColorSwatch value={item.color} size="sm" />
                <span>{colorLabel(item.color)}</span>
              </div>
            </div>
            <Badge variant="default">
              {PAINT_TYPE_LABELS[item.type] ?? item.type}
            </Badge>
          </div>

          <Separator />

          <DetailGrid item={item} />

          {item.note ? (
            <>
              <Separator />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  メモ
                </div>
                <div className="mt-1 whitespace-pre-wrap text-sm">{item.note}</div>
              </div>
            </>
          ) : null}

          <div className="text-[11px] text-muted-foreground">
            最終更新: {formatRelative(item.updatedAt)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailGrid({ item }: { item: Paint }) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "系統", value: PAINT_SYSTEM_LABELS[item.system] ?? "未設定" },
    { label: "容量", value: item.capacity || "-" },
    {
      label: "所持数",
      value: typeof item.qty === "number" ? `${item.qty}` : "-",
    },
    { label: "購入日", value: item.purchasedAt || "-" },
    {
      label: "バーコード",
      value: <span className="break-all font-mono text-xs">{item.barcode || "-"}</span>,
    },
  ];
  return (
    <dl className="grid grid-cols-2 gap-3 text-sm">
      {rows.map((r) => (
        <div key={r.label}>
          <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {r.label}
          </dt>
          <dd className="mt-0.5">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
