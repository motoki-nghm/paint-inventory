import { Link } from "react-router-dom";
import { Image as ImageIcon, Boxes, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TOOL_CATEGORY_LABELS,
  TOOL_CONDITION_LABELS,
  type Tool,
} from "@/types/tool";

interface ToolCardProps {
  item: Tool;
}

export function ToolCard({ item }: ToolCardProps) {
  const thumb = item.imageDataUrl || item.imageUrl || "";

  return (
    <Link
      to={`/tools/${item.id}`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-2xl"
    >
      <Card className="flex gap-3 p-3 transition hover:bg-accent/40">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-muted">
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
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="truncate text-sm font-semibold leading-tight">{item.name}</div>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
            {item.brand ? <span className="truncate">{item.brand}</span> : null}
            {item.location ? (
              <>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" aria-hidden />
                  {item.location}
                </span>
              </>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">
              {TOOL_CATEGORY_LABELS[item.category] ?? item.category}
            </Badge>
            <Badge variant="outline">
              {TOOL_CONDITION_LABELS[item.condition] ?? "良好"}
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
