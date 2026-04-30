import { Link } from "react-router-dom";
import { Image as ImageIcon, Boxes } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ColorSwatch } from "@/components/paint/color-swatch";
import { colorLabel } from "@/lib/color";
import {
  PAINT_SYSTEM_LABELS,
  PAINT_TYPE_LABELS,
  type Paint,
} from "@/types/paint";

interface PaintCardProps {
  item: Paint;
}

export function PaintCard({ item }: PaintCardProps) {
  const thumb = item.imageDataUrl || item.imageUrl || "";

  return (
    <Link
      to={`/item/${item.id}`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-2xl"
    >
      <Card className="flex gap-3 p-3 transition hover:bg-accent/40">
        <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-muted">
          {thumb ? (
            <img
              src={thumb}
              alt=""
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground" aria-hidden />
          )}
          <ColorSwatch
            value={item.color}
            size="sm"
            className="absolute bottom-1 right-1 rounded-full bg-background/80 p-0.5"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="truncate text-sm font-semibold leading-tight">{item.name}</div>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
            {item.brand ? <span className="truncate">{item.brand}</span> : null}
            {item.color ? (
              <>
                <span aria-hidden>·</span>
                <span>{colorLabel(item.color)}</span>
              </>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">
              {PAINT_TYPE_LABELS[item.type] ?? item.type}
            </Badge>
            <Badge variant="outline">
              {PAINT_SYSTEM_LABELS[item.system] ?? "未設定"}
            </Badge>
            {typeof item.qty === "number" ? (
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Boxes className="h-3 w-3" aria-hidden />
                <span className="font-medium text-foreground">{item.qty}</span>
              </span>
            ) : null}
          </div>
        </div>
      </Card>
    </Link>
  );
}
