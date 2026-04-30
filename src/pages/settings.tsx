import { useMemo, useState } from "react";
import {
  Cloud,
  CloudUpload,
  Copy,
  Download,
  LogOut,
  TriangleAlert,
  Upload,
  User as UserIcon,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePaintsStore } from "@/stores/paints-store";
import { useAuth } from "@/stores/auth-context";
import { clearAll } from "@/lib/storage";
import { importJsonSchema } from "@/lib/validators";
import { safeJsonParse, formatRelative } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";
import type { Paint } from "@/types/paint";

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const paints = usePaintsStore((s) => s.paints);
  const replaceAll = usePaintsStore((s) => s.replaceAll);
  const syncing = usePaintsStore((s) => s.syncing);
  const lastSyncedAt = usePaintsStore((s) => s.lastSyncedAt);
  const syncNow = usePaintsStore((s) => s.syncNow);

  const exportJson = useMemo(() => JSON.stringify({ paints }, null, 2), [paints]);
  const [importText, setImportText] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <Container className="space-y-3">
      {/* Account */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <SectionTitle icon={UserIcon}>アカウント</SectionTitle>
          {user ? (
            <>
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  ログイン中
                </div>
                <div className="mt-0.5 truncate text-sm font-medium">{user.email}</div>
              </div>
              <Button
                variant="secondary"
                className="w-full"
                onClick={async () => {
                  try {
                    await signOut();
                    toast.success("ログアウトしました");
                  } catch {
                    toast.error("ログアウトに失敗しました");
                  }
                }}
              >
                <LogOut className="h-4 w-4" aria-hidden />
                ログアウト
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">ログインしていません。</p>
          )}
        </CardContent>
      </Card>

      {/* Sync */}
      {user ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            <SectionTitle icon={Cloud}>クラウド同期</SectionTitle>
            <div className="text-xs text-muted-foreground">
              最終同期:{" "}
              {lastSyncedAt > 0 ? formatRelative(lastSyncedAt) : "未実行"}
            </div>
            <Button
              className="w-full"
              disabled={syncing}
              onClick={async () => {
                try {
                  await syncNow();
                  toast.success("同期しました");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "同期に失敗しました");
                }
              }}
            >
              <CloudUpload className="h-4 w-4" aria-hidden />
              {syncing ? "同期中…" : "今すぐ同期"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Export */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <SectionTitle icon={Download}>エクスポート (JSON)</SectionTitle>
          <p className="text-xs text-muted-foreground">
            現在のデータをコピーまたはダウンロードできます。
          </p>
          <Textarea readOnly value={exportJson} className="h-44 font-mono text-[11px]" />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="w-full"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(exportJson);
                  toast.success("クリップボードにコピーしました");
                } catch {
                  toast.error("コピーに失敗しました");
                }
              }}
            >
              <Copy className="h-4 w-4" aria-hidden />
              コピー
            </Button>
            <Button
              className="w-full"
              onClick={() => {
                const blob = new Blob([exportJson], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `paint-inventory-${new Date()
                  .toISOString()
                  .slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="h-4 w-4" aria-hidden />
              ダウンロード
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <SectionTitle icon={Upload}>インポート (JSON)</SectionTitle>
          <p className="text-xs text-muted-foreground">
            <code>{'{ "paints": [...] }'}</code> 形式の JSON を貼り付けてください。
          </p>
          <Textarea
            placeholder='{"paints":[]}'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="h-44 font-mono text-[11px]"
          />
          <Button
            className="w-full"
            onClick={() => {
              const parsed = safeJsonParse<unknown>(importText);
              if (!parsed.ok) {
                toast.error(`JSON が不正です: ${parsed.error}`);
                return;
              }
              const r = importJsonSchema.safeParse(parsed.value);
              if (!r.success) {
                toast.error("paints 配列が見つかりません");
                return;
              }
              replaceAll(r.data.paints as Paint[]);
              toast.success(`インポートしました (${r.data.paints.length} 件)`);
              setImportText("");
            }}
          >
            インポート
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Danger zone */}
      <Card className="border-destructive/40">
        <CardContent className="space-y-3 p-4">
          <SectionTitle icon={TriangleAlert} variant="danger">
            危険ゾーン
          </SectionTitle>
          <p className="text-xs text-muted-foreground">
            ローカル (IndexedDB) に保存されているデータを削除します。
          </p>
          <Button
            variant="danger"
            className="w-full"
            onClick={() => setConfirmClear(true)}
          >
            ローカルデータを全消去
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>本当に削除しますか?</DialogTitle>
            <DialogDescription>
              端末ローカルの全データを消去します。クラウド側のデータは削除されません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmClear(false)}>
              キャンセル
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                await clearAll();
                replaceAll([]);
                setConfirmClear(false);
                toast.success("ローカルデータを削除しました");
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

function SectionTitle({
  icon: Icon,
  children,
  variant,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  variant?: "danger";
}) {
  return (
    <div
      className={`flex items-center gap-2 text-sm font-semibold ${
        variant === "danger" ? "text-destructive" : ""
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {children}
    </div>
  );
}
