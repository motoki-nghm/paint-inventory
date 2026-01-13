import { useMemo, useState, useEffect } from "react";
import { PAINT_TYPES } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/ui/alert";
import { clamp } from "@/lib/utils";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

export default function PaintForm({ initial, submitLabel, onSubmit, onCancel, hint }) {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState(null);

  useEffect(() => {
    setDraft(initial);
  }, [initial]);

  const canSave = useMemo(() => String(draft.name ?? "").trim().length > 0, [draft.name]);

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="space-y-3">
      {hint ? <Alert>{hint}</Alert> : null}
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <div className="mx-auto w-full max-w-sm px-4 space-y-3">
        <label className="text-sm font-medium">商品名（必須）</label>
        <Input
          value={draft.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="例）Mr.カラー C1 ホワイト"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">ブランド</label>
          <Input value={draft.brand ?? ""} onChange={(e) => set({ brand: e.target.value })} placeholder="例）GSI" />
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
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">色</label>
          <Input value={draft.color ?? ""} onChange={(e) => set({ color: e.target.value })} placeholder="例）White" />
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

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">所持数</label>
          <Input
            type="number"
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

      <div className="space-y-2">
        <label className="text-sm font-medium">バーコード</label>
        <Input
          value={draft.barcode ?? ""}
          onChange={(e) => set({ barcode: e.target.value })}
          placeholder="EAN-13 / UPC"
        />
        <div className="text-xs text-[rgb(var(--muted-fg))]">※ スキャン画面で自動入力もできます</div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">メモ</label>
        <Textarea
          value={draft.note ?? ""}
          onChange={(e) => set({ note: e.target.value })}
          placeholder="例）使用感、希釈比、買った店…"
        />
      </div>

      <Separator />

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
          <div className="text-xs text-[rgb(var(--muted-fg))]">
            ※ Yahooショッピングから取得した画像です。差し替える場合は下から画像を選択してください。
          </div>
        ) : null}

        {draft.imageDataUrl || draft.imageUrl ? (
          <div className="mt-2">
            <img
              src={draft.imageDataUrl || draft.imageUrl}
              className="w-full rounded-lg border border-[rgb(var(--border))]"
            />
            <div className="mt-2 flex gap-2">
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

      <div className="pt-2 flex gap-2">
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
