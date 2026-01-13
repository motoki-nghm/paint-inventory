import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon } from "lucide-react";

export default function PaintCard({ item }) {
  const thumb = item.imageDataUrl || item.imageUrl || "";

  return (
    <Link to={`/item/${item.id}`} className="block">
      <Card className="hover:brightness-105">
        <CardContent className="p-3 flex gap-3">
          <div className="w-16 h-16 shrink-0 rounded-lg border border-[rgb(var(--border))] overflow-hidden bg-[rgb(var(--muted))] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            {thumb ? (
              <img src={thumb} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-6 h-6 text-[rgb(var(--muted-fg))]" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="font-medium truncate">{item.name}</div>

            <div className="mt-1 flex flex-wrap gap-1 items-center">
              {item.brand ? <span className="text-xs text-[rgb(var(--muted-fg))]">{item.brand}</span> : null}
              {item.color ? <span className="text-xs text-[rgb(var(--muted-fg))]">/ {item.color}</span> : null}
            </div>

            <div className="mt-2 flex gap-2 items-center">
              <Badge variant="secondary">{item.type || "other"}</Badge>
              {typeof item.qty === "number" ? (
                <span className="text-xs text-[rgb(var(--muted-fg))]">在庫: {item.qty}</span>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
