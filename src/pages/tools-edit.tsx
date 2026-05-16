import { useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container } from "@/components/layout/container";
import { FixedFooter } from "@/components/layout/fixed-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ToolForm } from "@/components/tool/tool-form";
import { useToolsStore } from "@/stores/tools-store";
import { toast } from "@/components/ui/toaster";
import type { ToolDraft } from "@/types/tool";

export function ToolsEditPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const item = useToolsStore((s) => (id ? s.getById(id) : null));
  const update = useToolsStore((s) => s.update);
  const submitRef = useRef<(() => Promise<boolean>) | null>(null);

  if (!item) {
    return (
      <Container className="space-y-3">
        <Alert variant="danger">データが見つかりませんでした。</Alert>
      </Container>
    );
  }

  const initial: ToolDraft = {
    id: item.id,
    name: item.name,
    brand: item.brand ?? "",
    category: item.category,
    condition: item.condition,
    qty: item.qty,
    location: item.location ?? "",
    note: item.note ?? "",
    purchasedAt: item.purchasedAt ?? "",
    imageDataUrl: item.imageDataUrl,
    imageUrl: item.imageUrl,
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

        <ToolForm
          initial={initial}
          submitLabel="更新する"
          onCancel={() => nav(`/tools/${item.id}`)}
          bindSubmit={(fn) => {
            submitRef.current = fn;
          }}
          onSubmit={async (draft) => {
            update(item.id, draft);
            toast.success("更新しました");
            nav(`/tools/${item.id}`);
          }}
        />
      </Container>

      <FixedFooter>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="w-full"
            size="lg"
            onClick={() => nav(`/tools/${item.id}`)}
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
