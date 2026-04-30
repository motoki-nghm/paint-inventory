import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "@/components/layout/container";
import { FixedFooter } from "@/components/layout/fixed-footer";
import { Button } from "@/components/ui/button";
import { PaintForm } from "@/components/paint/paint-form";
import { DuplicateDialog } from "@/components/paint/duplicate-dialog";
import {
  useBrands,
  usePaintsStore,
  usePinnedBrands,
} from "@/stores/paints-store";
import { toast } from "@/components/ui/toaster";
import type { Paint, PaintDraft } from "@/types/paint";

const BLANK: PaintDraft = {
  name: "",
  brand: "",
  type: "paint",
  system: "unknown",
  color: "unknown",
  qty: 1,
};

export function AddPage() {
  const nav = useNavigate();
  const add = usePaintsStore((s) => s.add);
  const applyBump = usePaintsStore((s) => s.applyDuplicateBump);
  const findByBarcode = usePaintsStore((s) => s.findByBarcode);
  const brands = useBrands();
  const pinnedBrands = usePinnedBrands();

  const submitRef = useRef<(() => Promise<boolean>) | null>(null);
  const [duplicate, setDuplicate] = useState<{ item: Paint; code: string } | null>(null);

  return (
    <>
      <Container className="space-y-3 pb-32">
        <PaintForm
          initial={BLANK}
          submitLabel="登録する"
          brandOptions={brands}
          pinnedBrands={pinnedBrands}
          onCancel={() => nav("/")}
          bindSubmit={(fn) => {
            submitRef.current = fn;
          }}
          onBarcodeBlur={(code) => {
            if (!code) return;
            const hit = findByBarcode(code);
            if (hit) setDuplicate({ item: hit, code });
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
        <Button
          className="w-full"
          size="lg"
          onClick={() => submitRef.current?.()}
        >
          登録する
        </Button>
      </FixedFooter>

      <DuplicateDialog
        open={!!duplicate}
        item={duplicate?.item ?? null}
        code={duplicate?.code ?? ""}
        onCancel={() => setDuplicate(null)}
        onBumpQty={() => {
          if (!duplicate) return;
          applyBump(duplicate.item.id);
          toast.success("所持数を +1 しました");
          setDuplicate(null);
          nav("/");
        }}
      />
    </>
  );
}
