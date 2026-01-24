import { useMemo, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/ui/alert";
import { clamp } from "@/lib/utils";
import { PAINT_TYPES, PAINT_SYSTEMS, PAINT_SYSTEM_LABELS, DEFAULT_COLOR, COLOR_PRESETS, isPresetColor } from "@/lib/db";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

export default function PaintForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  hint,
  brandOptions = [],
  bindSubmit,
  pinnedBrands = [],
}) {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const brandListId = "brand-options";

  const canSave = useMemo(() => String(draft.name ?? "").trim().length > 0, [draft.name]);

  const initialSig = useMemo(() => {
    return [
      initial?.id ?? "",
      initial?.barcode ?? "",
      initial?.name ?? "",
      initial?.imageUrl ?? "",
      initial?.imageDataUrl ? "1" : "0",
      initial?.color ?? "",
      initial?.brand ?? "",
      initial?.system ?? "",
      initial?.type ?? "",
      initial?.capacity ?? "",
    ].join("|");
  }, [initial]);

  const isCustomColor = draft.color && !isPresetColor(draft.color);

  useEffect(() => {
    setDraft(initial);
  }, [initialSig]);

  // ✅ async で onSubmit を await する（ScanPageで遷移しない問題の本丸）
  const handleSubmit = useCallback(async () => {
    console.log("[PaintForm] handleSubmit start", draft);

    setError(null);
    if (!String(draft.name ?? "").trim()) {
      setError("商品名は必須です。");
      return false;
    }

    try {
      setSubmitting(true);
      await onSubmit({ ...draft, name: String(draft.name).trim() });
      console.log("[PaintForm] onSubmit awaited");
      return true;
    } catch (e) {
      console.error(e);
      setError("保存に失敗しました。もう一度お試しください。");
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [draft, onSubmit]);

  // ✅ fixed footer から叩けるように関数を渡す（常に最新draftの関数になる）
  useEffect(() => {
    bindSubmit?.(() => handleSubmit());
    console.log("PaintForm bindSubmit called");
  }, [bindSubmit, handleSubmit]);

  return (
    <div className="mx-auto w-full max-w-[360px] px-5 py-2 space-y-5">
      {hint ? <Alert>{hint}</Alert> : null}
      {error ? <Alert variant="danger">{error}</Alert> : null}

      {/* ✅ 商品名（必須） */}
      <div className="space-y-2">
        <label className="text-sm font-medium">商品名（必須）</label>
        <Input
          value={draft.name ?? ""}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="例）Mr.カラー C1 ホワイト"
        />
      </div>

      {/* メーカー / 種類 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* メーカー */}
        <div className="space-y-2">
          <label className="text-sm font-medium">メーカー</label>
          {pinnedBrands.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {pinnedBrands.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => set({ brand: b })}
                  className="px-3 py-1.5 rounded-full text-xs border border-border bg-muted hover:bg-muted/70 text-foreground"
                >
                  {b}
                </button>
              ))}
            </div>
          ) : null}

          <Input
            list={brandListId}
            value={draft.brand ?? ""}
            onChange={(e) => set({ brand: e.target.value })}
            placeholder="例）GSI / TAMIYA / GAIA"
          />
          <datalist id={brandListId}>
            {brandOptions.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>

          <div className="text-xs text-muted-foreground">※ よく使うメーカーは上に固定表示されます</div>
        </div>

        {/* 種類 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">種類</label>
          <Select value={draft.type ?? "other"} onValueChange={(v) => set({ type: v })}>
            <SelectTrigger>
              <SelectValue placeholder="type" />
            </SelectTrigger>
            <SelectContent>
              {PAINT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 系統 */}
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">系統</label>
          <Select value={draft.system ?? "unknown"} onValueChange={(v) => set({ system: v })}>
            <SelectTrigger>
              <SelectValue placeholder="系統" />
            </SelectTrigger>
            <SelectContent>
              {PAINT_SYSTEMS.map((s) => (
                <SelectItem key={s} value={s}>
                  {PAINT_SYSTEM_LABELS[s] ?? s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 色 / 容量 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">色</label>
          <Select
            value={draft.color || "unknown"} // ✅ 空なら未設定
            onValueChange={(v) => set({ color: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="色を選択" />
            </SelectTrigger>
            <SelectContent>
              {COLOR_PRESETS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isCustomColor && (
            <Input
              value={draft.color}
              onChange={(e) => set({ color: e.target.value })}
              placeholder="例）スカイブルー / つや消し黒"
            />
          )}

          <div className="text-xs text-muted-foreground">※ プリセットに無い色は手入力できます</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">容量</label>
          <Input
            value={draft.capacity ?? ""}
            onChange={(e) => set({ capacity: e.target.value })}
            placeholder="例）10ml"
          />
        </div>
      </div>

      {/* 所持数 / 購入日 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">所持数</label>
          <Input
            type="number"
            inputMode="numeric"
            value={typeof draft.qty === "number" ? draft.qty : ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "") return set({ qty: undefined });
              set({ qty: clamp(Number(v), 0, 9999) });
            }}
            placeholder="例）2"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">購入日</label>
          <Input type="date" value={draft.purchasedAt ?? ""} onChange={(e) => set({ purchasedAt: e.target.value })} />
        </div>
      </div>

      {/* バーコード */}
      <div className="space-y-2">
        <label className="text-sm font-medium">バーコード</label>
        <Input
          value={draft.barcode ?? ""}
          onChange={(e) => set({ barcode: e.target.value })}
          placeholder="EAN-13 / UPC"
        />
        <div className="text-xs text-muted-foreground">※ スキャン画面で自動入力もできます</div>
      </div>

      {/* メモ */}
      <div className="space-y-2">
        <label className="text-sm font-medium">メモ</label>
        <Textarea
          value={draft.note ?? ""}
          onChange={(e) => set({ note: e.target.value })}
          placeholder="例）使用感、希釈比、買った店…"
        />
      </div>

      <Separator />

      {/* 画像 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">画像（任意）</label>
        <Input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              const dataUrl = await readFileAsDataUrl(file);
              set({ imageDataUrl: dataUrl });
            } catch {
              setError("画像の読み込みに失敗しました。別の画像でお試しください。");
            }
          }}
        />

        {draft.imageDataUrl || draft.imageUrl ? (
          <div className="mt-2 space-y-2">
            <img
              src={draft.imageDataUrl || draft.imageUrl}
              className="w-full rounded-lg border border-border"
              alt="preview"
            />
          </div>
        ) : null}
      </div>

      {/* 通常ボタン（フォーム内） */}
      <div className="pt-2 flex flex-col sm:flex-row gap-2">
        <Button className="w-full" disabled={!canSave || submitting} onClick={handleSubmit}>
          {submitting ? "保存中…" : submitLabel}
        </Button>
        {onCancel ? (
          <Button variant="secondary" className="w-full" onClick={onCancel} disabled={submitting}>
            キャンセル
          </Button>
        ) : null}
      </div>
    </div>
  );
}
