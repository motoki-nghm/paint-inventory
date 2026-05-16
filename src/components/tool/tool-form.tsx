import { useCallback, useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fileToCompressedDataUrl, ImageError } from "@/lib/image";
import { clamp } from "@/lib/utils";
import {
  TOOL_CATEGORIES,
  TOOL_CATEGORY_LABELS,
  TOOL_CONDITIONS,
  TOOL_CONDITION_LABELS,
  type ToolDraft,
} from "@/types/tool";
import { validateToolDraft } from "@/lib/validators";
import { toast } from "@/components/ui/toaster";

export interface ToolFormProps {
  initial: ToolDraft;
  submitLabel: string;
  onSubmit: (draft: ToolDraft) => void | Promise<void>;
  onCancel?: () => void;
  bindSubmit?: (fn: () => Promise<boolean>) => void;
}

export function ToolForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  bindSubmit,
}: ToolFormProps) {
  const [draft, setDraft] = useState<ToolDraft>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const initialSig = useMemo(
    () =>
      [
        initial.id ?? "",
        initial.name ?? "",
        initial.brand ?? "",
        initial.category ?? "",
        initial.condition ?? "",
        initial.imageUrl ?? "",
        initial.imageDataUrl ? "1" : "0",
      ].join("|"),
    [initial],
  );

  useEffect(() => {
    setDraft(initial);
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSig]);

  const set = (patch: Partial<ToolDraft>) =>
    setDraft((d) => ({ ...d, ...patch }));

  const handleSubmit = useCallback(async () => {
    const r = validateToolDraft({
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
      await onSubmit({ ...draft, name: draft.name.trim() });
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
      <Field label="工具名" required error={errors.name}>
        <Input
          value={draft.name ?? ""}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="例) ゴッドハンド アルティメットニッパー 5.0"
          autoComplete="off"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="メーカー" error={errors.brand}>
          <Input
            value={draft.brand ?? ""}
            onChange={(e) => set({ brand: e.target.value })}
            placeholder="例) GodHand / TAMIYA"
            autoComplete="off"
          />
        </Field>

        <Field label="カテゴリ">
          <Select
            value={draft.category ?? "other"}
            onValueChange={(v) => set({ category: v as ToolDraft["category"] })}
            options={TOOL_CATEGORIES.map((c) => ({
              value: c,
              label: TOOL_CATEGORY_LABELS[c],
            }))}
          />
        </Field>

        <Field label="状態">
          <Select
            value={draft.condition ?? "good"}
            onValueChange={(v) => set({ condition: v as ToolDraft["condition"] })}
            options={TOOL_CONDITIONS.map((c) => ({
              value: c,
              label: TOOL_CONDITION_LABELS[c],
            }))}
          />
        </Field>

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
            placeholder="例) 1"
            min={0}
            max={9999}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="保管場所" error={errors.location}>
          <Input
            value={draft.location ?? ""}
            onChange={(e) => set({ location: e.target.value })}
            placeholder="例) 工具箱 / 引き出しA"
            autoComplete="off"
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

      <Field label="メモ" error={errors.note}>
        <Textarea
          value={draft.note ?? ""}
          onChange={(e) => set({ note: e.target.value })}
          placeholder="例) 替刃の互換情報、使い分けの所感など"
        />
      </Field>

      <Separator />

      <Field
        label="画像 (任意)"
        hint="JPG / PNG / WebP・8MB 以下"
        error={errors.imageDataUrl}
      >
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface px-3 py-3 text-sm text-muted-foreground transition hover:bg-accent/40">
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
