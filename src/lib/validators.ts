import { z } from "zod";
import { PAINT_SYSTEMS, PAINT_TYPES } from "@/types/paint";
import { TOOL_CATEGORIES, TOOL_CONDITIONS } from "@/types/tool";

const trimmed = (max: number) =>
  z
    .string()
    .transform((v) => v.trim())
    .pipe(z.string().max(max));

export const paintDraftSchema = z.object({
  id: z.string().uuid().optional(),
  name: trimmed(120).pipe(z.string().min(1, "商品名は必須です")),
  brand: trimmed(80).optional(),
  type: z.enum(PAINT_TYPES).default("other"),
  system: z.enum(PAINT_SYSTEMS).default("unknown"),
  color: trimmed(40).default(""),
  note: trimmed(2000).optional(),
  capacity: trimmed(40).optional(),
  qty: z.number().int().min(0).max(9999).optional(),
  barcode: trimmed(32)
    .optional()
    .refine(
      (v) => !v || /^[0-9A-Z-]{4,32}$/i.test(v),
      "バーコードに使えない文字が含まれています",
    ),
  purchasedAt: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v),
      "購入日は YYYY-MM-DD で指定してください",
    ),
  imageUrl: z
    .string()
    .url()
    .max(2048)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  imageDataUrl: z
    .string()
    .max(8 * 1024 * 1024, "画像が大きすぎます (8MB 上限)")
    .optional(),
});

export type PaintDraftInput = z.input<typeof paintDraftSchema>;
export type PaintDraftParsed = z.output<typeof paintDraftSchema>;

/** Permissive: returns ok=false with field errors collected. */
export function validatePaintDraft(input: unknown) {
  const r = paintDraftSchema.safeParse(input);
  if (r.success) return { ok: true as const, value: r.data, errors: null };
  const errors: Record<string, string> = {};
  for (const issue of r.error.issues) {
    const k = issue.path.join(".") || "_";
    if (!errors[k]) errors[k] = issue.message;
  }
  return { ok: false as const, value: null, errors };
}

const JAN_RE = /^[0-9]{8}$|^[0-9]{12,14}$/;

export function isLikelyJan(code: string) {
  return JAN_RE.test(code);
}

export const importJsonSchema = z.object({
  paints: z.array(z.unknown()).max(10000),
});

export const toolDraftSchema = z.object({
  id: z.string().uuid().optional(),
  name: trimmed(120).pipe(z.string().min(1, "工具名は必須です")),
  brand: trimmed(80).optional(),
  category: z.enum(TOOL_CATEGORIES).default("other"),
  condition: z.enum(TOOL_CONDITIONS).default("good"),
  qty: z.number().int().min(0).max(9999).optional(),
  location: trimmed(80).optional(),
  note: trimmed(2000).optional(),
  purchasedAt: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v),
      "購入日は YYYY-MM-DD で指定してください",
    ),
  imageUrl: z
    .string()
    .url()
    .max(2048)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  imageDataUrl: z
    .string()
    .max(8 * 1024 * 1024, "画像が大きすぎます (8MB 上限)")
    .optional(),
});

export function validateToolDraft(input: unknown) {
  const r = toolDraftSchema.safeParse(input);
  if (r.success) return { ok: true as const, value: r.data, errors: null };
  const errors: Record<string, string> = {};
  for (const issue of r.error.issues) {
    const k = issue.path.join(".") || "_";
    if (!errors[k]) errors[k] = issue.message;
  }
  return { ok: false as const, value: null, errors };
}
