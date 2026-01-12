import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export default function PaintCard({ item }) {
  return (
    <Link to={`/item/${item.id}`}>
      <Card className="active:scale-[0.99] transition">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold leading-snug truncate">{item.name}</div>
              <div className="mt-1 text-xs text-[rgb(var(--muted-fg))] flex flex-wrap gap-1">
                {item.brand ? <span>{item.brand}</span> : <span className="opacity-60">ブランド未設定</span>}
                {item.color ? <span>• {item.color}</span> : null}
                {typeof item.qty === "number" ? <span>• qty {item.qty}</span> : null}
              </div>
              {item.barcode ? (
                <div className="mt-1 text-[11px] text-[rgb(var(--muted-fg))] truncate">barcode: {item.barcode}</div>
              ) : null}
            </div>
            <div className="shrink-0 flex items-center gap-2">
              {item.type ? <Badge>{item.type}</Badge> : <Badge variant="secondary">type?</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
