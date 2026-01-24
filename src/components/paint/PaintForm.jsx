import { useMemo, useState, useEffect } from "react";
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

  const handleSubmit = () => {
    setError(null);
    if (!String(draft.name ?? "").trim()) {
      setError("商品名は必須です。");
      return;
    }
    onSubmit({ ...draft, name: String(draft.name).trim() });
  };

  useEffect(() => {
    bindSubmit?.(handleSubmit);
  }, [draft]);

  const initialSig = useMemo(() => {
    return [
      initial?.id ?? "",
      initial?.barcode ?? "",
      initial?.name ?? "",
      initial?.imageUrl ?? "",
      initial?.imageDataUrl ? "1" : "0",
    ].join("|");
  }, [initial]);

  useEffect(() => {
    // ✅ 初期値が空ならホワイト（DEFAULT_COLOR）を入れて「keyが空」問題を回避
    if (!draft?.color) set((d) => ({ ...d, color: DEFAULT_COLOR }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSave = useMemo(() => String(draft.name ?? "").trim().length > 0, [draft.name]);
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const brandListId = "brand-options";

  return (
    <div className="mx-auto w-full max-w-[360px] px-5 py-2 space-y-5">
      {hint ? <Alert>{hint}</Alert> : null}
      {error ? <Alert variant="danger">{error}</Alert> : null}

      {/* 商品名 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">商品名（必須）</label>
        <Input
          value={draft.name ?? ""}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="例）Mr.カラー C1 ホワイト"
        />
      </div>

      {/* ブランド / 種類 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* ✅ ブランド欄 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">ブランド</label>

          {/* ✅ 固定表示（よく使う） */}
          {pinnedBrands.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {pinnedBrands.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => set({ brand: b })}
                  className={[
                    "px-3 py-1.5 rounded-full text-xs border",
                    "border-border bg-muted hover:bg-muted/70",
                    "text-foreground",
                  ].join(" ")}
                >
                  {b}
                </button>
              ))}
            </div>
          ) : null}

          {/* ✅ 候補付きInput（手入力OK） */}
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

          <div className="text-xs text-muted-foreground">※ よく使うブランドは上に固定表示されます</div>
        </div>

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

        <div className="space-y-2">
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
            value={isPresetColor(draft.color) ? draft.color : DEFAULT_COLOR}
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

          {/* ✅ プリセット外だけ手入力 */}
          {!isPresetColor(draft.color) ? (
            <Input
              value={draft.color ?? ""}
              onChange={(e) => set({ color: e.target.value })}
              placeholder="例）スカイブルー / つや消し黒 など"
            />
          ) : null}

          <div className="text-xs text-muted-foreground">※ プリセットに無い色は（手入力）で自由に入力できます</div>
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

        {draft.imageUrl && !draft.imageDataUrl ? (
          <div className="text-xs text-muted-foreground">
            ※ Yahooショッピングから取得した画像です。差し替える場合は下から画像を選択してください。
          </div>
        ) : null}

        {draft.imageDataUrl || draft.imageUrl ? (
          <div className="mt-2 space-y-2">
            <img
              src={draft.imageDataUrl || draft.imageUrl}
              className="w-full rounded-lg border border-border"
              alt="preview"
            />
            <div className="flex gap-2">
              {draft.imageDataUrl ? (
                <Button variant="secondary" onClick={() => set({ imageDataUrl: undefined })}>
                  画像を削除
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => set({ imageUrl: undefined })}>
                  Yahoo画像を削除
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* ボタン（スマホは縦並びで押しやすく） */}
      <div className="pt-2 flex flex-col sm:flex-row gap-2">
        <Button
          className="w-full"
          disabled={!canSave}
          onClick={() => {
            setError(null);
            if (!String(draft.name ?? "").trim()) {
              setError("商品名は必須です。");
              return;
            }
            onSubmit({ ...draft, name: String(draft.name).trim() });
          }}
        >
          {submitLabel}
        </Button>

        {onCancel ? (
          <Button variant="secondary" className="w-full" onClick={onCancel}>
            キャンセル
          </Button>
        ) : null}
      </div>
    </div>
  );
}
