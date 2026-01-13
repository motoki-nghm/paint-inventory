import { useNavigate } from "react-router-dom";
import Container from "@/components/layout/Container";
import PaintAdd from "@/components/paint/PaintAdd";
import { usePaints } from "@/lib/PaintsProvider";
import { Card, CardContent } from "@/components/ui/card";

export default function AddPage() {
  const nav = useNavigate();
  const { add } = usePaints();

  return (
    <Container className="space-y-3">
      <Card>
        <CardContent className="p-4">
          <div className="text-lg font-semibold">手入力で追加</div>
          <div className="text-sm text-muted-foreground">商品名は必須。その他は任意です。</div>
        </CardContent>
      </Card>

      <PaintAdd
        onSubmit={(draft) => {
          const item = add(draft);
          nav(`/item/${item.id}`);
        }}
        onCancel={() => nav("/")}
      />
    </Container>
  );
}
