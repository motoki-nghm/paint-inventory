import { useNavigate } from "react-router-dom";
import Container from "@/components/layout/Container";
import ScanAdd from "@/components/paint/ScanAdd";
import { usePaints } from "@/lib/PaintsProvider";
import { Card, CardContent } from "@/components/ui/card";

export default function ScanPage() {
  const nav = useNavigate();
  const { add } = usePaints();

  return (
    <Container className="space-y-3">
      <Card>
        <CardContent className="p-4">
          <div className="text-lg font-semibold">バーコードで追加</div>
          <div className="text-sm text-[rgb(var(--muted-fg))]">
            スキャン成功 → 商品名取得（失敗してもOK）→ フォームで編集して保存
          </div>
        </CardContent>
      </Card>

      <ScanAdd
        onCancel={() => nav("/")}
        onSave={(draft) => {
          const item = add(draft);
          nav(`/item/${item.id}`);
        }}
      />
    </Container>
  );
}
