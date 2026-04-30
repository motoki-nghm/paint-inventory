import { useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container } from "@/components/layout/container";
import { FixedFooter } from "@/components/layout/fixed-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { PaintForm } from "@/components/paint/paint-form";
import {
  useBrands,
  usePaintsStore,
  usePinnedBrands,
} from "@/stores/paints-store";
import { toast } from "@/components/ui/toaster";
import type { PaintDraft } from "@/types/paint";

export function EditPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const item = usePaintsStore((s) => (id ? s.getById(id) : null));
  const update = usePaintsStore((s) => s.update);
  const brands = useBrands();
  const pinnedBrands = usePinnedBrands();
  const submitRef = useRef<(() => Promise<boolean>) | null>(null);

  if (!item) {
    return (
      <Container className="space-y-3">
        <Alert variant="danger">データが見つかりませんでした。</Alert>
      </Container>
    );
  }

  const initial: PaintDraft = {
    id: item.id,
    name: item.name,
    brand: item.brand ?? "",
    type: item.type,
    color: item.color ?? "",
    note: item.note ?? "",
    capacity: item.capacity ?? "",
    qty: item.qty,
    barcode: item.barcode ?? "",
    purchasedAt: item.purchasedAt ?? "",
    imageDataUrl: item.imageDataUrl,
    imageUrl: item.imageUrl,
    system: item.system ?? "unknown",
  };

  return (
    <>
      <Container className="space-y-3 pb-32">
        <Card>
          <CardContent className="p-4">
            <div className="text-base font-semibold">編集</div>
            <p className="text-xs text-muted-foreground">
              更新すると即座に保存・同期されます。
            </p>
          </CardContent>
        </Card>

        <PaintForm
          initial={initial}
          submitLabel="更新する"
          brandOptions={brands}
          pinnedBrands={pinnedBrands}
          onCancel={() => nav(`/item/${item.id}`)}
          bindSubmit={(fn) => {
            submitRef.current = fn;
          }}
          onSubmit={async (draft) => {
            update(item.id, draft);
            toast.success("更新しました");
            nav(`/item/${item.id}`);
          }}
        />
      </Container>

      <FixedFooter>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="w-full"
            size="lg"
            onClick={() => nav(`/item/${item.id}`)}
          >
            キャンセル
          </Button>
          <Button
            className="w-full"
            size="lg"
            onClick={() => submitRef.current?.()}
          >
            更新する
          </Button>
        </div>
      </FixedFooter>
    </>
  );
}
