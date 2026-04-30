import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ColorSwatch } from "@/components/paint/color-swatch";
import { colorLabel } from "@/lib/color";
import type { Paint } from "@/types/paint";

interface DuplicateDialogProps {
  open: boolean;
  item: Paint | null;
  code: string;
  onCancel: () => void;
  onBumpQty: () => void;
}

export function DuplicateDialog({
  open,
  item,
  code,
  onCancel,
  onBumpQty,
}: DuplicateDialogProps) {
  return (
    <Dialog open={open && !!item} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>登録済みのバーコード</DialogTitle>
          <DialogDescription>
            同じバーコードが見つかりました。所持数を <strong>+1</strong> しますか？
          </DialogDescription>
        </DialogHeader>

        {item ? (
          <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{item.name}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <ColorSwatch value={item.color} size="sm" />
                  <span>{colorLabel(item.color)}</span>
                  {item.brand ? <span>· {item.brand}</span> : null}
                </div>
              </div>
              {typeof item.qty === "number" ? (
                <div className="text-right shrink-0">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    現在
                  </div>
                  <div className="text-base font-semibold">{item.qty}</div>
                </div>
              ) : null}
            </div>
            <div className="text-[11px] text-muted-foreground break-all">
              barcode: {item.barcode || code}
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="secondary" onClick={onCancel}>
            キャンセル
          </Button>
          <Button onClick={onBumpQty}>+1 する</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
