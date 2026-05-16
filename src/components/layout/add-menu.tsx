import { useNavigate } from "react-router-dom";
import {
  type LucideIcon,
  Palette,
  ScanLine,
  Wrench,
} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

interface AddMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMenu({ open, onOpenChange }: AddMenuProps) {
  const nav = useNavigate();
  const go = (to: string) => {
    onOpenChange(false);
    nav(to);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm animate-fade-in" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-[100] mx-auto w-full max-w-md",
            "rounded-t-3xl border-t border-l border-r border-border bg-card text-card-foreground shadow-2xl",
            "p-4 pb-[max(1rem,env(safe-area-inset-bottom))] animate-sheet-up",
          )}
        >
          <DialogPrimitive.Title className="sr-only">追加メニュー</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            塗料または工具を追加します
          </DialogPrimitive.Description>

          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30" aria-hidden />

          <div className="space-y-2">
            <ActionRow
              icon={Palette}
              tone="paint"
              title="塗料を追加"
              subtitle="手入力で1件登録"
              onClick={() => go("/add")}
            />
            <ActionRow
              icon={ScanLine}
              tone="paint"
              title="バーコードで塗料を追加"
              subtitle="カメラで JAN を読み取り"
              onClick={() => go("/scan")}
            />
            <ActionRow
              icon={Wrench}
              tone="tool"
              title="工具を追加"
              subtitle="商品検索または手入力"
              onClick={() => go("/tools/add")}
            />
          </div>

          <DialogPrimitive.Close className="mt-3 w-full rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground">
            キャンセル
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

interface ActionRowProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  tone: "paint" | "tool";
  onClick: () => void;
}

function ActionRow({ icon: Icon, title, subtitle, tone, onClick }: ActionRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-3 text-left transition active:scale-[0.99] hover:bg-accent/50"
    >
      <span
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
          tone === "paint"
            ? "bg-primary/15 text-primary ring-1 ring-primary/30"
            : "bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/30",
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold leading-tight">{title}</span>
        <span className="block text-[11px] text-muted-foreground">{subtitle}</span>
      </span>
    </button>
  );
}
