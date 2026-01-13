import { Link, useNavigate, useParams } from "react-router-dom";
import Container from "@/components/layout/Container";
import { usePaints } from "@/lib/PaintsProvider";
import PaintDetail from "@/components/paint/PaintDetail";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Pencil } from "lucide-react";
import { Alert } from "@/components/ui/alert";

export default function DetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { getById, remove } = usePaints();

  const item = id ? getById(id) : null;

  if (!item) {
    return (
      <Container className="space-y-3">
        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</pre>

        <Alert variant="danger">データが見つかりませんでした。</Alert>
        <Link to="/">
          <Button className="w-full">一覧へ</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="space-y-3">
      <PaintDetail item={item} />

      <Card>
        <CardContent className="p-3 flex gap-2">
          <Link to={`/item/${item.id}/edit`} className="w-full">
            <Button className="w-full gap-2">
              <Pencil className="h-4 w-4" />
              編集
            </Button>
          </Link>
          <Button
            variant="danger"
            className="w-full gap-2"
            onClick={() => {
              const ok = confirm("削除しますか？（元に戻せません）");
              if (!ok) return;
              remove(item.id);
              nav("/");
            }}
          >
            <Trash2 className="h-4 w-4" />
            削除
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
