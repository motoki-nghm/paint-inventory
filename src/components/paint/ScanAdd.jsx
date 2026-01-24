import { useEffect, useMemo, useRef, useState } from "react";
import { startBarcodeScan } from "@/lib/barcode";
import { productLookup } from "@/lib/productLookup";
import PaintAdd from "@/components/paint/PaintAdd";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { usePaints } from "@/lib/PaintsProvider";

export default function ScanAdd({ onSave, onCancel, bindSubmit, brandOptions = [], pinnedBrands = [] }) {
  const videoRef = useRef(null);
  const handleRef = useRef(null);

  const [barcode, setBarcode] = useState("");
  const [lookupName, setLookupName] = useState("");
  const [lookupSource, setLookupSource] = useState("");
  const [status, setStatus] = useState("idle"); // idle|scanning|found|lookup|ready|error
  const [message, setMessage] = useState("");
  const [lookupImageUrl, setLookupImageUrl] = useState("");
  const { findByBarcode, update } = usePaints();

  const [dupOpen, setDupOpen] = useState(false);
  const [dupItem, setDupItem] = useState(null); // 既存アイテム
  const [dupCode, setDupCode] = useState(""); // 念のため保持

  const hint = useMemo(() => {
    if (status === "scanning") return "バーコードを枠内に合わせてください。連続検出は自動で抑制します。";
    if (status === "lookup") return "商品名を取得中…（失敗しても手入力で保存できます）";
    if (status === "ready" && barcode) {
      return lookupName
        ? `取得できました：${lookupName}（source: ${lookupSource}）`
        : "商品名が取得できませんでした。バーコードだけ反映しているので、商品名を手入力して保存してください。";
    }
    return "カメラが起動しない場合は権限/ブラウザ/HTTPS を確認してください。";
  }, [status, barcode, lookupName, lookupSource]);

  async function resetAndRescan(msg = "") {
    setBarcode("");
    setLookupName("");
    setLookupSource("");
    setLookupImageUrl("");
    setMessage(msg);
    setStatus("idle");

    // すぐ再開
    await beginScan();
  }

  async function beginScan() {
    setStatus("scanning");
    setMessage("");

    const video = videoRef.current;
    if (!video) return;

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

        try {
          handleRef.current?.stop();
        } catch {}
        handleRef.current = null;

        setStatus("lookup");
        const r = await productLookup(code);

        if (r?.name) {
          setLookupName(r.name);
          setLookupSource(r.source);
          setLookupImageUrl(r.imageUrl || "");
        } else {
          setLookupName("");
          setLookupSource("");
          setLookupImageUrl("");
        }

        // lookup 結果反映後（setLookupName/source の後）に重複チェック
        const existing = findByBarcode(code);
        if (existing) {
          setDupItem(existing);
          setDupCode(code);
          setDupOpen(true);
          setStatus("ready"); // 画面のヒント表示を崩さないため（任意）
          return; // ✅ ここで止める（フォームに進ませない）
        }

        setStatus("ready");
      },
    });
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

  const initial = useMemo(
    () => ({
      barcode: barcode || "",
      name: lookupName || "",
      imageUrl: lookupImageUrl || "",
      color: "white",
      type: "paint",
      system: "unknown",
      qty: 1,
    }),
    [barcode, lookupName, lookupImageUrl],
  );

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

                setBarcode("");
                setLookupName("");
                setLookupSource("");
                setLookupImageUrl("");
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
        hint="スキャン結果はフォームに反映されています。必要なら編集して保存してください。"
        initial={initial}
        onSubmit={onSave}
        onCancel={onCancel}
        bindSubmit={bindSubmit}
        brandOptions={brandOptions}
        pinnedBrands={pinnedBrands}
      />
      {/* ✅ 重複モーダル（UI統一：Card + Button で自前実装） */}
      {dupOpen && dupItem ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => {
              setDupOpen(false);
              setDupItem(null);
              void resetAndRescan("キャンセルしました。");
            }}
          />
          {/* panel */}
          <Card className="relative w-full max-w-[420px]">
            <CardContent className="p-4 space-y-3">
              <div className="text-base font-semibold">登録済みのバーコードです</div>
              <div className="text-sm text-muted-foreground">
                同じバーコードが見つかりました。所持数を <span className="font-semibold">+1</span> しますか？
              </div>

              <div className="rounded-lg border border-border p-3 bg-muted/30">
                <div className="text-sm font-medium">{dupItem.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {dupItem.brand ? `メーカー: ${dupItem.brand} / ` : ""}
                  barcode: {dupItem.barcode || dupCode}
                  {typeof dupItem.qty === "number" ? ` / 所持数: ${dupItem.qty}` : ""}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setDupOpen(false);
                    setDupItem(null);
                    void resetAndRescan("キャンセルしました。");
                  }}
                >
                  しない（キャンセル）
                </Button>

                <Button
                  className="w-full"
                  onClick={async () => {
                    try {
                      const nextQty = (typeof dupItem.qty === "number" ? dupItem.qty : 0) + 1;
                      update(dupItem.id, { qty: nextQty }); // ✅ 既存を +1（update内で updatedAt も更新される想定）
                      setDupOpen(false);
                      setDupItem(null);
                      await resetAndRescan("所持数を +1 しました。");
                    } catch (e) {
                      console.error(e);
                      setMessage("更新に失敗しました。");
                      setDupOpen(false);
                      setDupItem(null);
                      await resetAndRescan("");
                    }
                  }}
                >
                  +1 する
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
