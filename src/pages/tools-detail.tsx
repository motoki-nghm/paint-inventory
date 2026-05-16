import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToolsStore } from "@/stores/tools-store";
import { toast } from "@/components/ui/toaster";
import { formatRelative } from "@/lib/utils";
import {
  TOOL_CATEGORY_LABELS,
  TOOL_CONDITION_LABELS,
  type Tool,
} from "@/types/tool";

export function ToolsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const item = useToolsStore((s) => (id ? s.getById(id) : null));
  const remove = useToolsStore((s) => s.remove);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!item) {
    return (
      <Container className="space-y-3">
        <Alert variant="danger">データが見つかりませんでした。</Alert>
        <Link to="/tools">
          <Button className="w-full">
            <ArrowLeft className="h-4 w-4" /> 一覧へ戻る
          </Button>
        </Link>
      </Container>
    );
  }

  const src = item.imageDataUrl || item.imageUrl;

  return (
    <Container className="space-y-3">
      <div className="space-y-3">
        {src ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <img
              src={src}
              alt={item.name}
              referrerPolicy="no-referrer"
              className="block w-full"
            />
          </div>
        ) : null}

        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <div className="text-lg font-semibold leading-snug">{item.name}</div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{item.brand || "メーカー未設定"}</span>
                </div>
              </div>
              <Badge variant="default">
                {TOOL_CATEGORY_LABELS[item.category] ?? item.category}
              </Badge>
            </div>

            <Separator />

            <DetailGrid item={item} />

            {item.note ? (
              <>
                <Separator />
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    メモ
                  </div>
                  <div className="mt-1 whitespace-pre-wrap text-sm">{item.note}</div>
                </div>
              </>
            ) : null}

            <div className="text-[11px] text-muted-foreground">
              最終更新: {formatRelative(item.updatedAt)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="grid grid-cols-2 gap-2 p-3">
          <Link to={`/tools/${item.id}/edit`}>
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
                nav("/tools", { replace: true });
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

function DetailGrid({ item }: { item: Tool }) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "状態", value: TOOL_CONDITION_LABELS[item.condition] ?? "良好" },
    {
      label: "所持数",
      value: typeof item.qty === "number" ? `${item.qty}` : "-",
    },
    { label: "保管場所", value: item.location || "-" },
    { label: "購入日", value: item.purchasedAt || "-" },
  ];
  return (
    <dl className="grid grid-cols-2 gap-3 text-sm">
      {rows.map((r) => (
        <div key={r.label}>
          <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {r.label}
          </dt>
          <dd className="mt-0.5">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
