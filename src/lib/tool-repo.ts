import { supabase } from "@/lib/supabase";
import { isUuid } from "@/lib/utils";
import type { Tool, ToolCategory, ToolCondition } from "@/types/tool";

interface ToolRow {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  name: string;
  brand: string | null;
  category: string | null;
  condition: string | null;
  qty: number | null;
  location: string | null;
  note: string | null;
  purchased_at: string | null;
  image_url: string | null;
  image_data_url: string | null;
}

function fromRow(r: ToolRow): Tool {
  return {
    id: r.id,
    createdAt: new Date(r.created_at).getTime(),
    updatedAt: new Date(r.updated_at).getTime(),
    name: r.name,
    brand: r.brand ?? undefined,
    category: (r.category ?? "other") as ToolCategory,
    condition: (r.condition ?? "good") as ToolCondition,
    qty: typeof r.qty === "number" ? r.qty : undefined,
    location: r.location ?? undefined,
    note: r.note ?? undefined,
    purchasedAt: r.purchased_at ?? undefined,
    imageUrl: r.image_url ?? undefined,
    imageDataUrl: r.image_data_url ?? undefined,
  };
}

function toRow(userId: string, t: Tool) {
  return {
    id: t.id,
    user_id: userId,
    name: t.name,
    brand: t.brand ?? null,
    category: t.category ?? "other",
    condition: t.condition ?? "good",
    qty: typeof t.qty === "number" ? t.qty : null,
    location: t.location ?? null,
    note: t.note ?? null,
    purchased_at: t.purchasedAt ?? null,
    image_url: t.imageUrl ?? null,
    image_data_url: t.imageDataUrl ?? null,
  };
}

async function getSessionUser() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user ?? null;
}

export async function fetchTools(): Promise<Tool[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const pageSize = 1000;
  let from = 0;
  const all: ToolRow[] = [];

  for (;;) {
    const { data, error } = await supabase
      .from("tools")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    const rows = (data ?? []) as ToolRow[];
    all.push(...rows);
    if (rows.length < pageSize) break;
    from += pageSize;
  }

  return all.map(fromRow);
}

export async function upsertTool(t: Tool) {
  const user = await getSessionUser();
  if (!user) throw new Error("Not signed in");
  if (!isUuid(t.id)) throw new Error("invalid tool id");
  const { error } = await supabase
    .from("tools")
    .upsert(toRow(user.id, t), { onConflict: "id" });
  if (error) throw error;
}

export async function deleteTool(id: string) {
  const user = await getSessionUser();
  if (!user) throw new Error("Not signed in");
  if (!isUuid(id)) throw new Error("invalid tool id");
  const { error } = await supabase
    .from("tools")
    .delete()
    .eq("user_id", user.id)
    .eq("id", id);
  if (error) throw error;
}
