import { useEffect, useMemo, useState } from "react";
import { DEFAULT_FILTERS } from "@/lib/db";
import { loadState, saveState } from "@/lib/storage";
import { contains, now } from "@/lib/utils";
import { getSessionUser, fetchPaintsSupabase, upsertPaintSupabase, deletePaintSupabase } from "@/lib/paintRepoSupabase";

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export function usePaints() {
  const [paints, setPaints] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const user = await getSessionUser();
        if (user) {
          const cloud = await fetchPaintsSupabase();
          setPaints(cloud);
          setLoaded(true);
          return;
        }
      } catch {
        // Supabaseが死んでてもローカルにフォールバック
      }

      const state = await loadState();
      const normalized = (state.paints || []).map((p) => ({ system: "unknown", ...p }));
      setPaints(normalized);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;

    (async () => {
      const user = await getSessionUser();
      if (user) return; // ✅ ログイン中はクラウドが正
      await saveState(paints);
    })();
  }, [paints, loaded]);

  const brands = useMemo(() => {
    const s = new Set();
    for (const p of paints) if (p.brand?.trim()) s.add(p.brand.trim());
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [paints]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return paints
      .filter((p) => {
        if (filters.type !== "all" && p.type !== filters.type) return false;
        if (filters.brand !== "all" && (p.brand ?? "") !== filters.brand) return false;
        if (filters.system !== "all" && (p.system ?? "unknown") !== filters.system) return false;

        if (!q) return true;
        return (
          contains(p.name, q) ||
          contains(p.brand, q) ||
          contains(p.color, q) ||
          contains(p.note, q) ||
          contains(p.barcode, q)
        );
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [paints, filters]);

  function getById(id) {
    return paints.find((p) => p.id === id) ?? null;
  }

  function add(input) {
    const t = now();
    const item = {
      id: uuid(),
      createdAt: t,
      updatedAt: t,
      name: String(input.name ?? "").trim(),
      brand: input.brand?.trim() || undefined,
      type: input.type ?? "other",
      color: input.color?.trim() || undefined,
      note: input.note?.trim() || undefined,
      capacity: input.capacity?.trim() || undefined,
      qty: typeof input.qty === "number" ? input.qty : undefined,
      barcode: input.barcode?.trim() || undefined,
      purchasedAt: input.purchasedAt || undefined,
      imageDataUrl: input.imageDataUrl || undefined,
      imageUrl: input.imageUrl || undefined,
      system: input.system || "unknown",
    };
    setPaints((prev) => [item, ...prev]);
    void (async () => {
      try {
        const user = await getSessionUser();
        if (!user) return;
        await upsertPaintSupabase(item);
      } catch (e) {
        console.warn("supabase upsert failed (add)", e);
      }
    })();
    return item;
  }

  function update(id, patch) {
    setPaints((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        void (async () => {
          try {
            const user = await getSessionUser();
            if (!user) return;
            const latest = getById(id);
            if (latest) await upsertPaintSupabase(latest);
          } catch (e) {
            console.warn("supabase upsert failed (update)", e);
          }
        })();

        return {
          ...p,
          ...patch,
          name: String(patch.name ?? p.name).trim(),
          brand: (patch.brand ?? p.brand)?.trim() || undefined,
          color: (patch.color ?? p.color)?.trim() || undefined,
          note: (patch.note ?? p.note)?.trim() || undefined,
          capacity: (patch.capacity ?? p.capacity)?.trim() || undefined,
          barcode: (patch.barcode ?? p.barcode)?.trim() || undefined,
          purchasedAt: patch.purchasedAt ?? p.purchasedAt,
          qty: typeof patch.qty === "number" ? patch.qty : p.qty,
          type: patch.type ?? p.type,
          imageDataUrl: patch.imageDataUrl ?? p.imageDataUrl,
          updatedAt: now(),
          imageUrl: patch.imageUrl ?? p.imageUrl,
          system: patch.system ?? p.system,
        };
      })
    );
  }

  function remove(id) {
    setPaints((prev) => prev.filter((p) => p.id !== id));
    void (async () => {
      try {
        const user = await getSessionUser();
        if (!user) return;
        await deletePaintSupabase(id);
      } catch (e) {
        console.warn("supabase delete failed", e);
      }
    })();
  }

  function replaceAll(next) {
    setPaints(next);
  }

  return {
    paints,
    filtered,
    filters,
    setFilters,
    brands,
    loaded,
    getById,
    add,
    update,
    remove,
    replaceAll,
  };
}
