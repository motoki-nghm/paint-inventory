import { useCallback, useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ColorSwatch } from "@/components/paint/color-swatch";
import { fileToCompressedDataUrl, ImageError } from "@/lib/image";
import { isPresetColor, normalizeColor } from "@/lib/color";
import { clamp } from "@/lib/utils";
import {
  COLOR_PRESETS,
  PAINT_SYSTEMS,
  PAINT_SYSTEM_LABELS,
  PAINT_TYPES,
  PAINT_TYPE_LABELS,
  type PaintDraft,
} from "@/types/paint";
import { validatePaintDraft } from "@/lib/validators";
import { toast } from "@/components/ui/toaster";

export interface PaintFormProps {
  initial: PaintDraft;
  submitLabel: string;
  hint?: string;
  brandOptions?: string[];
  pinnedBrands?: string[];
  onSubmit: (draft: PaintDraft) => void | Promise<void>;
  onCancel?: () => void;
  bindSubmit?: (fn: () => Promise<boolean>) => void;
  /** Called when user changes the barcode field — useful for parents to detect duplicates. */
  onBarcodeBlur?: (code: string) => void;
}

export function PaintForm({
  initial,
  submitLabel,
  hint,
  brandOptions = [],
  pinnedBrands = [],
  onSubmit,
  onCancel,
  bindSubmit,
  onBarcodeBlur,
}: PaintFormProps) {
  const [draft, setDraft] = useState<PaintDraft>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Resync only when the *identity* of `initial` changes (not on every render).
  const initialSig = useMemo(
    () =>
      [
        initial.id ?? "",
        initial.barcode ?? "",
        initial.name ?? "",
        initial.imageUrl ?? "",
        initial.imageDataUrl ? "1" : "0",
        initial.color ?? "",
        initial.brand ?? "",
        initial.system ?? "",
        initial.type ?? "",
      ].join("|"),
    [initial],
  );

  useEffect(() => {
    setDraft(initial);
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSig]);

  const set = (patch: Partial<PaintDraft>) =>
    setDraft((d) => ({ ...d, ...patch }));

  const isCustomColor =
    !!draft.color && !isPresetColor(draft.color) && draft.color !== "unknown";

  const handleSubmit = useCallback(async () => {
    const r = validatePaintDraft({
      ...draft,
      qty: typeof draft.qty === "number" ? draft.qty : undefined,
    });
    if (!r.ok) {
      setErrors(r.errors);
      const first = Object.values(r.errors)[0];
      if (first) toast.error(first);
      return false;
    }

    try {
      setSubmitting(true);
      setErrors({});
      await onSubmit({
        ...draft,
        name: draft.name.trim(),
        color: normalizeColor(draft.color),
      });
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "保存に失敗しました";
      toast.error(msg);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [draft, onSubmit]);

  useEffect(() => {
    bindSubmit?.(() => handleSubmit());
  }, [bindSubmit, handleSubmit]);

  return (
    <div className="space-y-5">
      {hint ? <Alert>{hint}</Alert> : null}

      <Field label="商品名" required error={errors.name}>
        <Input
          value={draft.name ?? ""}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="例) Mr.カラー C1 ホワイト"
          autoComplete="off"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="メーカー" error={errors.brand}>
          {pinnedBrands.length > 0 ? (
            <div className="-mb-1 flex flex-wrap gap-1.5">
              {pinnedBrands.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => set({ brand: b })}
                  className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] text-foreground transition hover:bg-accent"
                >
                  {b}
                </button>
              ))}
            </div>
          ) : null}
          <Input
            list="brand-options"
            value={draft.brand ?? ""}
            onChange={(e) => set({ brand: e.target.value })}
            placeholder="例) GSI / TAMIYA / GAIA"
            autoComplete="off"
          />
          <datalist id="brand-options">
            {brandOptions.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </Field>

        <Field label="種類">
          <Select
            value={draft.type ?? "other"}
            onValueChange={(v) => set({ type: v as PaintDraft["type"] })}
            options={PAINT_TYPES.map((t) => ({
              value: t,
              label: PAINT_TYPE_LABELS[t],
            }))}
          />
        </Field>

        <Field label="系統" className="sm:col-span-2">
          <Select
            value={draft.system ?? "unknown"}
            onValueChange={(v) => set({ system: v as PaintDraft["system"] })}
            options={PAINT_SYSTEMS.map((s) => ({
              value: s,
              label: PAINT_SYSTEM_LABELS[s],
            }))}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field
          label="色"
          hint="プリセットに無い色は手入力できます"
          error={errors.color}
        >
          <div className="flex items-center gap-2">
            <ColorSwatch value={draft.color || "unknown"} size="lg" />
            <div className="flex-1">
              <Select
                value={isCustomColor ? "__custom__" : draft.color || "unknown"}
                onValueChange={(v) => {
                  if (v === "__custom__") {
                    set({ color: "" });
                    return;
                  }
                  set({ color: v });
                }}
                options={[
                  ...COLOR_PRESETS.map((c) => ({ value: c.value, label: c.label })),
                  { value: "__custom__", label: "── 手入力" },
                ]}
              />
            </div>
          </div>
          {isCustomColor || draft.color === "" ? (
            <Input
              value={draft.color ?? ""}
              onChange={(e) => set({ color: e.target.value })}
              placeholder="例) スカイブルー / つや消し黒"
              autoComplete="off"
            />
          ) : null}
        </Field>

        <Field label="容量" error={errors.capacity}>
          <Input
            value={draft.capacity ?? ""}
            onChange={(e) => set({ capacity: e.target.value })}
            placeholder="例) 10ml"
            autoComplete="off"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="所持数" error={errors.qty}>
          <Input
            type="number"
            inputMode="numeric"
            value={typeof draft.qty === "number" ? draft.qty : ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "") return set({ qty: undefined });
              set({ qty: clamp(Number(v), 0, 9999) });
            }}
            placeholder="例) 2"
            min={0}
            max={9999}
          />
        </Field>
        <Field label="購入日" error={errors.purchasedAt}>
          <Input
            type="date"
            value={draft.purchasedAt ?? ""}
            onChange={(e) => set({ purchasedAt: e.target.value })}
          />
        </Field>
      </div>

      <Field
        label="バーコード"
        hint="スキャン画面で自動入力もできます"
        error={errors.barcode}
      >
        <Input
          value={draft.barcode ?? ""}
          onChange={(e) => set({ barcode: e.target.value })}
          onBlur={() => onBarcodeBlur?.(String(draft.barcode ?? "").trim())}
          placeholder="EAN-13 / UPC"
          inputMode="numeric"
          autoComplete="off"
        />
      </Field>

      <Field label="メモ" error={errors.note}>
        <Textarea
          value={draft.note ?? ""}
          onChange={(e) => set({ note: e.target.value })}
          placeholder="例) 使用感、希釈比、買った店…"
        />
      </Field>

      <Separator />

      <Field
        label="画像 (任意)"
        hint="JPG / PNG / WebP・8MB 以下。アップロード時に自動で 1280px に縮小します"
        error={errors.imageDataUrl}
      >
        <label
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface px-3 py-3 text-sm text-muted-foreground transition hover:bg-accent/40"
        >
          <Upload className="h-4 w-4" aria-hidden />
          画像を選択
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              try {
                const dataUrl = await fileToCompressedDataUrl(file);
                set({ imageDataUrl: dataUrl });
              } catch (err) {
                if (err instanceof ImageError) toast.error(err.message);
                else toast.error("画像の読み込みに失敗しました");
              }
            }}
          />
        </label>

        {draft.imageDataUrl || draft.imageUrl ? (
          <div className="relative mt-2 overflow-hidden rounded-xl border border-border">
            <img
              src={draft.imageDataUrl || draft.imageUrl}
              alt="プレビュー"
              referrerPolicy="no-referrer"
              className="block w-full"
            />
            <button
              type="button"
              onClick={() => set({ imageDataUrl: undefined, imageUrl: undefined })}
              className="absolute right-2 top-2 rounded-md bg-background/85 px-2 py-1 text-[11px] font-medium text-foreground hover:bg-background"
            >
              画像を削除
            </button>
          </div>
        ) : (
          <div className="mt-2 flex h-24 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-xs text-muted-foreground">
            <ImageIcon className="mr-2 h-4 w-4" aria-hidden /> プレビューはここに表示されます
          </div>
        )}
      </Field>

      <div className="flex flex-col gap-2 pt-2 sm:flex-row">
        <Button
          className="w-full"
          size="lg"
          disabled={!draft.name || submitting}
          onClick={handleSubmit}
        >
          {submitting ? "保存中…" : submitLabel}
        </Button>
        {onCancel ? (
          <Button
            variant="secondary"
            className="w-full"
            size="lg"
            onClick={onCancel}
            disabled={submitting}
          >
            キャンセル
          </Button>
        ) : null}
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

function Field({ label, required, hint, error, className, children }: FieldProps) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label required={required}>{label}</Label>
      {children}
      {hint && !error ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
      {error ? (
        <p className="text-[11px] text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
