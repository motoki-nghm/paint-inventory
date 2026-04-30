import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { PaintDetail } from "@/components/paint/paint-detail";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePaintsStore } from "@/stores/paints-store";
import { toast } from "@/components/ui/toaster";

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const item = usePaintsStore((s) => (id ? s.getById(id) : null));
  const remove = usePaintsStore((s) => s.remove);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!item) {
    return (
      <Container className="space-y-3">
        <Alert variant="danger">データが見つかりませんでした。</Alert>
        <Link to="/">
          <Button className="w-full">
            <ArrowLeft className="h-4 w-4" /> 一覧へ戻る
          </Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="space-y-3">
      <PaintDetail item={item} />

      <Card>
        <CardContent className="grid grid-cols-2 gap-2 p-3">
          <Link to={`/item/${item.id}/edit`}>
            <Button className="w-full" size="lg">
              <Pencil className="h-4 w-4" aria-hidden /> 編集
            </Button>
          </Link>
          <Button
            variant="danger"
            size="lg"
            className="w-full"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="h-4 w-4" aria-hidden /> 削除
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>削除しますか?</DialogTitle>
            <DialogDescription>
              「{item.name}」を削除します。元に戻せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              キャンセル
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                remove(item.id);
                toast.success("削除しました");
                nav("/", { replace: true });
              }}
            >
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
