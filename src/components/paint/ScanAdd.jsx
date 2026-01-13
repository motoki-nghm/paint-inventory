import { useEffect, useMemo, useRef, useState } from "react";
import { startBarcodeScan } from "@/lib/barcode";
import { productLookup } from "@/lib/productLookup";
import PaintAdd from "@/components/paint/PaintAdd";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ScanAdd({ onSave, onCancel }) {
  const videoRef = useRef(null);
  const handleRef = useRef(null);

  const [barcode, setBarcode] = useState("");
  const [lookupName, setLookupName] = useState("");
  const [lookupSource, setLookupSource] = useState("");
  const [lookupImageUrl, setLookupImageUrl] = useState("");

  const [status, setStatus] = useState("idle"); // idle|scanning|found|lookup|ready|error
  const [message, setMessage] = useState("");

  const hint = useMemo(() => {
    if (status === "scanning") return "バーコードを枠内に合わせてください。連続検出は自動で抑制します。";
    if (status === "lookup") return "商品情報を取得中…（失敗しても手入力で保存できます）";
    if (status === "ready" && barcode) {
      return lookupName
        ? `取得できました：${lookupName}${lookupSource ? `（source: ${lookupSource}）` : ""}`
        : "商品が見つかりませんでした。バーコードだけ反映しています。商品名を手入力して保存してください。";
    }
    return "カメラが起動しない場合は権限/ブラウザ/HTTPS を確認してください。";
  }, [status, barcode, lookupName, lookupSource]);

  async function beginScan() {
    setStatus("scanning");
    setMessage("");

    const video = videoRef.current;
    if (!video) return;

    // 念のため前回ハンドルが残っていれば停止
    try {
      handleRef.current?.stop();
    } catch {}
    handleRef.current = null;

    try {
      handleRef.current = await startBarcodeScan({
        video,
        repeatGuardMs: 1500,
        onError: (m) => {
          setStatus("error");
          setMessage(m);
        },
        onResult: async (code) => {
          setBarcode(code);
          setStatus("found");
          setMessage("");

          // stop once found
          try {
            handleRef.current?.stop();
          } catch {}
          handleRef.current = null;

          setStatus("lookup");

          let r = null;
          try {
            r = await productLookup(code);
          } catch {
            r = null;
          }

          if (r?.name) {
            setLookupName(r.name);
            setLookupSource(r.source || "");
            setLookupImageUrl(r.imageUrl || ""); // ✅ ここが抜けてた
          } else {
            setLookupName("");
            setLookupSource("");
            setLookupImageUrl("");
          }

          setStatus("ready");
        },
      });
    } catch (e) {
      setStatus("error");
      setMessage(e?.message || "カメラの起動に失敗しました。権限/HTTPS/ブラウザを確認してください。");
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await beginScan();
    })();

    return () => {
      cancelled = true;
      try {
        handleRef.current?.stop();
      } catch {}
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initial = {
    barcode: barcode || "",
    name: lookupName || "",
    imageUrl: lookupImageUrl || "",
  };

  // ✅ initial が変わったらフォームを確実に更新
  const formKey = `${barcode}:${lookupName}:${lookupImageUrl}`;

  return (
    <div className="space-y-3">
      {message ? <Alert variant="danger">{message}</Alert> : null}
      <Alert>{hint}</Alert>

      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="relative overflow-hidden rounded-lg border border-border bg-black">
            <video ref={videoRef} className="h-[260px] w-full object-cover" muted playsInline />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-64 rounded-lg border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="w-full"
              onClick={async () => {
                try {
                  handleRef.current?.stop();
                } catch {}
                handleRef.current = null;

                // ✅ reset state
                setBarcode("");
                setLookupName("");
                setLookupSource("");
                setLookupImageUrl(""); // ✅ これもリセット
                setStatus("idle");
                setMessage("");

                await beginScan();
              }}
            >
              再スキャン
            </Button>
            <Button className="w-full" onClick={onCancel}>
              戻る
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <PaintAdd
        key={formKey}
        hint="スキャン結果はフォームに反映されています。必要なら編集して保存してください。"
        initial={initial}
        onSubmit={onSave}
        onCancel={onCancel}
      />
    </div>
  );
}
