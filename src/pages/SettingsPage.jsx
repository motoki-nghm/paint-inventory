import { useMemo, useState } from "react";
import Container from "@/components/layout/Container";
import { usePaints } from "@/lib/PaintsProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { safeJsonParse } from "@/lib/utils";
import { clearAll } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";
import { LogOut } from "lucide-react";

export default function SettingsPage() {
  const { paints, replaceAll } = usePaints();
  const { user } = useAuth();
  const [msg, setMsg] = useState("");

  const exportJson = useMemo(() => JSON.stringify({ paints }, null, 2), [paints]);

  return (
    <Container className="space-y-3">
      {msg ? <Alert>{msg}</Alert> : null}

      {/* アカウント */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="text-lg font-semibold">アカウント</div>
          {user ? (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                ログイン中：<span className="font-semibold text-foreground">{user.email}</span>
              </div>
              <Button
                variant="secondary"
                className="w-full gap-2"
                onClick={async () => {
                  try {
                    await supabase.auth.signOut();
                  } catch (e) {
                    console.error(e);
                    setMsg("ログアウトに失敗しました。");
                  }
                }}
              >
                <LogOut className="h-4 w-4" />
                ログアウト
              </Button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">ログインしていません。</div>
          )}
        </CardContent>
      </Card>

      {/* エクスポート */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="font-semibold">エクスポート（JSON）</div>
          <div className="text-sm text-muted-foreground">以下をコピーして保存できます。</div>
          <textarea
            className="w-full h-44 rounded-lg border border-border bg-muted p-3 text-xs"
            readOnly
            value={exportJson}
          />
          <Button
            onClick={async () => {
              await navigator.clipboard.writeText(exportJson);
              setMsg("クリップボードにコピーしました。");
            }}
          >
            コピー
          </Button>
        </CardContent>
      </Card>

      {/* インポート */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="font-semibold">インポート（JSON）</div>
          <div className="text-sm text-muted-foreground">{`{ "paints": [...] }`} 形式のJSONを貼り付けてください。</div>
          <ImportBox
            onImport={(text) => {
              const parsed = safeJsonParse(text);
              if (!parsed.ok) {
                setMsg(`JSONが不正です: ${parsed.error}`);
                return;
              }
              if (!Array.isArray(parsed.value?.paints)) {
                setMsg("JSON形式が不正です: paints が配列ではありません。");
                return;
              }
              replaceAll(parsed.value.paints);
              setMsg(`インポートしました（${parsed.value.paints.length}件）`);
            }}
          />
        </CardContent>
      </Card>

      <Separator />

      {/* 危険ゾーン */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="font-semibold text-destructive">危険：データ全消去</div>
          <div className="text-sm text-muted-foreground">IndexedDB 内の保存データを削除します。</div>
          <Button
            variant="danger"
            onClick={async () => {
              const ok = confirm("全データを削除しますか？（元に戻せません）");
              if (!ok) return;
              await clearAll();
              replaceAll([]);
              setMsg("全データを削除しました。");
            }}
          >
            全消去
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}

function ImportBox({ onImport }) {
  const [text, setText] = useState("");
  return (
    <div className="space-y-2">
      <textarea
        className="w-full h-44 rounded-lg border border-border bg-muted p-3 text-xs"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='{"paints":[...]}'
      />
      <Button onClick={() => onImport(text)}>インポート</Button>
    </div>
  );
}
