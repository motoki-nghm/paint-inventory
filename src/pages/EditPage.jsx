import { useNavigate, useParams } from "react-router-dom";
import Container from "@/components/layout/Container";
import { usePaints } from "@/lib/PaintsProvider";
import PaintEdit from "@/components/paint/PaintEdit";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export default function EditPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { getById, update } = usePaints();

  const item = id ? getById(id) : null;

  if (!item) {
    return (
      <Container className="space-y-3">
        <Alert variant="danger">データが見つかりませんでした。</Alert>
      </Container>
    );
  }

  return (
    <Container className="space-y-3">
      <Card>
        <CardContent className="p-4">
          <div className="text-lg font-semibold">編集</div>
          <div className="text-sm text-[rgb(var(--muted-fg))]">更新内容はローカルに保存されます。</div>
        </CardContent>
      </Card>

      <PaintEdit
        initial={{
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
        }}
        onCancel={() => nav(`/item/${item.id}`)}
        onSubmit={(draft) => {
          update(item.id, draft);
          nav(`/item/${item.id}`);
        }}
      />
    </Container>
  );
}
