import { useMemo, useState } from "react";
import Container from "@/components/layout/Container";
import { usePaints } from "@/lib/PaintsProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { safeJsonParse } from "@/lib/utils";
import { clearAll } from "@/lib/storage";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { paints, replaceAll } = usePaints();
  const [msg, setMsg] = useState("");

  const exportJson = useMemo(() => JSON.stringify({ paints }, null, 2), [paints]);

  return (
    <Container className="space-y-3">
      {msg ? <Alert>{msg}</Alert> : null}

      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="text-lg font-semibold">設定</div>
          <div className="text-sm text-muted-foreground">JSON インポート/エクスポート、全消去</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="font-semibold">エクスポート（JSON）</div>
          <div className="text-sm text-muted-foreground">以下をコピーして保存できます。</div>
          <textarea
            className="w-full h-44 rounded-lg border border-border bg-[rgb(var(--bg))] p-3 text-xs"
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

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="font-semibold text-[rgb(var(--danger))]">危険：データ全消去</div>
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

      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="font-semibold">環境変数（任意）</div>
          <div className="text-sm text-muted-foreground">
            UPCItemDB を使う場合は <code className="px-1 py-0.5 rounded bg-muted-foreground">VITE_UPCITEMDB_KEY</code>{" "}
            を設定してください。 未設定でも Open Food Facts → 失敗時は手入力で保存できます。
          </div>
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
        className="w-full h-44 rounded-lg border border-border bg-[rgb(var(--bg))] p-3 text-xs"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='{"paints":[...]}'
      />
      <Button onClick={() => onImport(text)}>インポート</Button>
    </div>
  );
}
