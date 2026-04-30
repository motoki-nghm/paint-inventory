import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "@/components/layout/container";
import { FixedFooter } from "@/components/layout/fixed-footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScanView, type ScanResult } from "@/components/paint/scan-view";
import { PaintForm } from "@/components/paint/paint-form";
import { DuplicateDialog } from "@/components/paint/duplicate-dialog";
import {
  useBrands,
  usePaintsStore,
  usePinnedBrands,
} from "@/stores/paints-store";
import { toast } from "@/components/ui/toaster";
import type { Paint, PaintDraft } from "@/types/paint";

export function ScanPage() {
  const nav = useNavigate();
  const add = usePaintsStore((s) => s.add);
  const applyBump = usePaintsStore((s) => s.applyDuplicateBump);
  const findByBarcode = usePaintsStore((s) => s.findByBarcode);
  const brands = useBrands();
  const pinnedBrands = usePinnedBrands();

  const submitRef = useRef<(() => Promise<boolean>) | null>(null);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [duplicate, setDuplicate] = useState<{ item: Paint; code: string } | null>(null);

  const initial = useMemo<PaintDraft>(
    () => ({
      barcode: scan?.barcode ?? "",
      name: scan?.name ?? "",
      imageUrl: scan?.imageUrl || undefined,
      color: "unknown",
      type: "paint",
      system: "unknown",
      qty: 1,
    }),
    [scan],
  );

  function rescan() {
    setScan(null);
    setResetSignal((n) => n + 1);
  }

  return (
    <>
      <Container className="space-y-3 pb-32">
        <ScanView
          resetSignal={resetSignal}
          onResult={(r) => {
            setScan(r);
            const existing = findByBarcode(r.barcode);
            if (existing) {
              setDuplicate({ item: existing, code: r.barcode });
              return;
            }
            if (r.name) {
              toast.success(`商品名を取得: ${r.name}`, {
                description: r.source,
              });
            } else if (r.barcode) {
              toast.message("バーコードを読み取りました", {
                description: "商品名は手入力してください",
              });
            }
          }}
        />

        <Separator />

        <PaintForm
          initial={initial}
          submitLabel="登録する"
          hint={
            scan?.name
              ? `スキャン結果を反映しました (source: ${scan.source})`
              : scan?.barcode
                ? "バーコードを反映しました。商品名を手入力してください。"
                : "バーコードを読み取ると、フォームに自動反映されます。"
          }
          brandOptions={brands}
          pinnedBrands={pinnedBrands}
          onCancel={() => nav("/")}
          bindSubmit={(fn) => {
            submitRef.current = fn;
          }}
          onSubmit={async (draft) => {
            const r = add(draft);
            if ("duplicate" in r) {
              setDuplicate({ item: r.duplicate, code: String(draft.barcode ?? "") });
              return;
            }
            toast.success("登録しました");
            nav("/");
          }}
        />
      </Container>

      <FixedFooter>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="w-full"
            size="lg"
            onClick={rescan}
          >
            再スキャン
          </Button>
          <Button
            className="w-full"
            size="lg"
            onClick={() => submitRef.current?.()}
          >
            登録する
          </Button>
        </div>
      </FixedFooter>

      <DuplicateDialog
        open={!!duplicate}
        item={duplicate?.item ?? null}
        code={duplicate?.code ?? ""}
        onCancel={() => {
          setDuplicate(null);
          rescan();
          toast.message("キャンセルしました");
        }}
        onBumpQty={() => {
          if (!duplicate) return;
          applyBump(duplicate.item.id);
          toast.success("所持数を +1 しました");
          setDuplicate(null);
          rescan();
        }}
      />
    </>
  );
}
