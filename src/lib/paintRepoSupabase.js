import { supabase } from "@/lib/supabase";

function fromRow(r) {
  return {
    id: r.id,
    createdAt: new Date(r.created_at).getTime(),
    updatedAt: new Date(r.updated_at).getTime(),
    name: r.name,
    brand: r.brand ?? "",
    type: r.type ?? "other",
    system: r.system ?? "unknown",
    color: r.color ?? "",
    note: r.note ?? "",
    capacity: r.capacity ?? "",
    qty: typeof r.qty === "number" ? r.qty : undefined,
    barcode: r.barcode ?? "",
    purchasedAt: r.purchased_at ?? "",
    imageUrl: r.image_url ?? "",
    imageDataUrl: r.image_data_url ?? undefined,
  };
}

function toRow(userId, p) {
  return {
    id: p.id,
    user_id: userId,
    name: p.name,
    brand: p.brand || null,
    type: p.type || "other",
    system: p.system || "unknown",
    color: p.color || null,
    note: p.note || null,
    capacity: p.capacity || null,
    qty: typeof p.qty === "number" ? p.qty : null,
    barcode: p.barcode || null,
    purchased_at: p.purchasedAt || null,
    image_url: p.imageUrl || null,
    image_data_url: p.imageDataUrl || null,
  };
}

export async function getSessionUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session?.user ?? null;
}

export async function fetchPaintsSupabase() {
  if (!supabase) throw new Error("Supabase not configured");
  const user = await getSessionUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("paints")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function upsertPaintSupabase(paint) {
  if (!supabase) throw new Error("Supabase not configured");
  const user = await getSessionUser();
  if (!user) throw new Error("Not signed in");

  const row = toRow(user.id, paint);
  const { error } = await supabase.from("paints").upsert(row);
  if (error) throw error;
}

export async function deletePaintSupabase(id) {
  if (!supabase) throw new Error("Supabase not configured");
  const user = await getSessionUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase.from("paints").delete().eq("user_id", user.id).eq("id", id);
  if (error) throw error;
}
