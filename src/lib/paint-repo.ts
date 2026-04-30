import { supabase } from "@/lib/supabase";
import { normalizeColor } from "@/lib/color";
import { isUuid } from "@/lib/utils";
import type { Paint } from "@/types/paint";

interface PaintRow {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  name: string;
  brand: string | null;
  type: string | null;
  system: string | null;
  color: string | null;
  note: string | null;
  capacity: string | null;
  qty: number | null;
  barcode: string | null;
  purchased_at: string | null;
  image_url: string | null;
  image_data_url: string | null;
}

function fromRow(r: PaintRow): Paint {
  return {
    id: r.id,
    createdAt: new Date(r.created_at).getTime(),
    updatedAt: new Date(r.updated_at).getTime(),
    name: r.name,
    brand: r.brand ?? undefined,
    type: (r.type ?? "other") as Paint["type"],
    system: (r.system ?? "unknown") as Paint["system"],
    color: normalizeColor(r.color),
    note: r.note ?? undefined,
    capacity: r.capacity ?? undefined,
    qty: typeof r.qty === "number" ? r.qty : undefined,
    barcode: r.barcode ?? undefined,
    purchasedAt: r.purchased_at ?? undefined,
    imageUrl: r.image_url ?? undefined,
    imageDataUrl: r.image_data_url ?? undefined,
  };
}

function toRow(userId: string, p: Paint) {
  return {
    id: p.id,
    user_id: userId,
    name: p.name,
    brand: p.brand ?? null,
    type: p.type ?? "other",
    system: p.system ?? "unknown",
    color: p.color ?? null,
    note: p.note ?? null,
    capacity: p.capacity ?? null,
    qty: typeof p.qty === "number" ? p.qty : null,
    barcode: p.barcode ?? null,
    purchased_at: p.purchasedAt ?? null,
    image_url: p.imageUrl ?? null,
    image_data_url: p.imageDataUrl ?? null,
  };
}

export async function getSessionUser() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user ?? null;
}

export async function fetchPaints(): Promise<Paint[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const pageSize = 1000;
  let from = 0;
  const all: PaintRow[] = [];

  for (;;) {
    const { data, error } = await supabase
      .from("paints")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    const rows = (data ?? []) as PaintRow[];
    all.push(...rows);
    if (rows.length < pageSize) break;
    from += pageSize;
  }

  return all.map(fromRow);
}

export async function upsertPaint(p: Paint) {
  const user = await getSessionUser();
  if (!user) throw new Error("Not signed in");
  if (!isUuid(p.id)) throw new Error("invalid paint id");
  const { error } = await supabase
    .from("paints")
    .upsert(toRow(user.id, p), { onConflict: "id" });
  if (error) throw error;
}

export async function deletePaint(id: string) {
  const user = await getSessionUser();
  if (!user) throw new Error("Not signed in");
  if (!isUuid(id)) throw new Error("invalid paint id");
  const { error } = await supabase
    .from("paints")
    .delete()
    .eq("user_id", user.id)
    .eq("id", id);
  if (error) throw error;
}

export async function bulkUpsert(paints: Paint[]) {
  const user = await getSessionUser();
  if (!user) throw new Error("Not signed in");
  const valid = paints.filter((p) => isUuid(p.id));
  if (valid.length === 0) return;
  const chunkSize = 200;
  for (let i = 0; i < valid.length; i += chunkSize) {
    const chunk = valid.slice(i, i + chunkSize).map((p) => toRow(user.id, p));
    const { error } = await supabase.from("paints").upsert(chunk, { onConflict: "id" });
    if (error) throw error;
  }
}
