import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type {
  GroupBy,
  Paint,
  PaintDraft,
  PaintFilters,
  PaintSystem,
  PaintType,
} from "@/types/paint";
import { DEFAULT_FILTERS } from "@/types/paint";
import { normalizeColor } from "@/lib/color";
import { contains, now, uuid } from "@/lib/utils";
import { loadState, saveState } from "@/lib/storage";
import {
  bulkUpsert,
  deletePaint as deleteOnServer,
  fetchPaints,
  getSessionUser,
  upsertPaint as upsertOnServer,
} from "@/lib/paint-repo";

interface PaintsState {
  paints: Paint[];
  filters: PaintFilters;
  groupBy: GroupBy;
  loaded: boolean;
  syncing: boolean;
  lastSyncedAt: number;
  error: string | null;

  // initial loaders
  initialize: () => Promise<void>;

  // mutations
  add: (input: PaintDraft) => Paint | { duplicate: Paint };
  applyDuplicateBump: (existingId: string) => void;
  update: (id: string, patch: Partial<PaintDraft>) => void;
  remove: (id: string) => void;
  replaceAll: (next: Paint[]) => void;

  // filters
  setFilters: (next: PaintFilters) => void;
  setGroupBy: (g: GroupBy) => void;

  // sync
  syncNow: () => Promise<void>;

  // helpers
  findByBarcode: (code: string) => Paint | null;
  getById: (id: string) => Paint | null;
}

const LAST_SYNC_KEY = "paint-inventory.lastSyncedAt";

function loadNum(key: string): number {
  try {
    const v = localStorage.getItem(key);
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function saveNum(key: string, v: number) {
  try {
    localStorage.setItem(key, String(v));
  } catch {
    // ignore
  }
}

function normalizeBarcode(v: unknown): string {
  return String(v ?? "").trim();
}

function pushOptimisticToServer(paint: Paint) {
  void (async () => {
    try {
      const user = await getSessionUser();
      if (!user) return;
      await upsertOnServer(paint);
    } catch (err) {
      console.warn("[paints] upsert failed", err);
    }
  })();
}

function persistLocalIfGuest(paints: Paint[]) {
  void (async () => {
    try {
      const user = await getSessionUser();
      if (user) return;
      await saveState(paints);
    } catch {
      // ignore
    }
  })();
}

export const usePaintsStore = create<PaintsState>((set, get) => ({
  paints: [],
  filters: DEFAULT_FILTERS,
  groupBy: "type",
  loaded: false,
  syncing: false,
  lastSyncedAt: loadNum(LAST_SYNC_KEY),
  error: null,

  async initialize() {
    if (get().loaded) return;
    try {
      const user = await getSessionUser();
      if (user) {
        const cloud = await fetchPaints();
        const normalized = cloud.map((p) => ({ ...p, color: normalizeColor(p.color) }));
        set({ paints: normalized, loaded: true, error: null });
        return;
      }
    } catch (err) {
      // fall through to local
      console.warn("[paints] cloud load failed, falling back to local", err);
    }
    const state = await loadState();
    const normalized = (state.paints ?? []).map((p) => ({
      ...p,
      color: normalizeColor(p.color),
      system: (p.system ?? "unknown") as PaintSystem,
      type: (p.type ?? "other") as PaintType,
    }));
    set({ paints: normalized, loaded: true, error: null });
  },

  add(input) {
    const code = normalizeBarcode(input.barcode);
    const state = get();

    if (code) {
      const existing = state.paints.find((p) => normalizeBarcode(p.barcode) === code);
      if (existing) return { duplicate: existing };
    }

    const t = now();
    const item: Paint = {
      id: uuid(),
      createdAt: t,
      updatedAt: t,
      name: String(input.name ?? "").trim(),
      brand: String(input.brand ?? "").trim() || undefined,
      type: input.type ?? "other",
      system: input.system ?? "unknown",
      color: normalizeColor(input.color),
      note: String(input.note ?? "").trim() || undefined,
      capacity: String(input.capacity ?? "").trim() || undefined,
      qty: typeof input.qty === "number" ? input.qty : undefined,
      barcode: code || undefined,
      purchasedAt: input.purchasedAt || undefined,
      imageDataUrl: input.imageDataUrl || undefined,
      imageUrl: input.imageUrl || undefined,
    };

    if (!item.name) {
      set({ error: "商品名は必須です" });
      return item;
    }

    const next = [item, ...state.paints];
    set({ paints: next, error: null });
    pushOptimisticToServer(item);
    persistLocalIfGuest(next);
    return item;
  },

  applyDuplicateBump(existingId) {
    const target = get().paints.find((p) => p.id === existingId);
    if (!target) return;
    const nextQty = (typeof target.qty === "number" ? target.qty : 0) + 1;
    get().update(existingId, { qty: nextQty });
  },

  update(id, patch) {
    let updated: Paint | null = null;
    const next = get().paints.map((p) => {
      if (p.id !== id) return p;
      const merged: Paint = {
        ...p,
        ...patch,
        name: String(patch.name ?? p.name).trim(),
        brand: ((patch.brand ?? p.brand) ?? "").trim() || undefined,
        color: normalizeColor(patch.color ?? p.color),
        note: ((patch.note ?? p.note) ?? "").trim() || undefined,
        capacity: ((patch.capacity ?? p.capacity) ?? "").trim() || undefined,
        barcode: ((patch.barcode ?? p.barcode) ?? "").trim() || undefined,
        purchasedAt: patch.purchasedAt ?? p.purchasedAt,
        qty: typeof patch.qty === "number" ? patch.qty : p.qty,
        type: patch.type ?? p.type,
        system: patch.system ?? p.system,
        imageDataUrl: patch.imageDataUrl ?? p.imageDataUrl,
        imageUrl: patch.imageUrl ?? p.imageUrl,
        updatedAt: now(),
      };
      updated = merged;
      return merged;
    });
    set({ paints: next });
    if (updated) pushOptimisticToServer(updated);
    persistLocalIfGuest(next);
  },

  remove(id) {
    const next = get().paints.filter((p) => p.id !== id);
    set({ paints: next });
    void (async () => {
      try {
        const user = await getSessionUser();
        if (!user) return;
        await deleteOnServer(id);
      } catch (err) {
        console.warn("[paints] delete failed", err);
      }
    })();
    persistLocalIfGuest(next);
  },

  replaceAll(next) {
    set({ paints: next });
    persistLocalIfGuest(next);
  },

  setFilters(next) {
    set({ filters: next });
  },

  setGroupBy(g) {
    set({ groupBy: g });
  },

  async syncNow() {
    if (get().syncing) return;
    set({ syncing: true, error: null });
    try {
      const user = await getSessionUser();
      if (!user) throw new Error("ログインしてから同期してください");
      await bulkUpsert(get().paints);
      const cloud = await fetchPaints();
      set({
        paints: cloud.map((p) => ({ ...p, color: normalizeColor(p.color) })),
        lastSyncedAt: Date.now(),
      });
      saveNum(LAST_SYNC_KEY, Date.now());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "同期に失敗しました";
      set({ error: msg });
      throw err;
    } finally {
      set({ syncing: false });
    }
  },

  findByBarcode(code) {
    const key = normalizeBarcode(code);
    if (!key) return null;
    return get().paints.find((p) => normalizeBarcode(p.barcode) === key) ?? null;
  },

  getById(id) {
    return get().paints.find((p) => p.id === id) ?? null;
  },
}));

// Selectors
export const useFilteredPaints = () =>
  usePaintsStore(
    useShallow((s) => {
      const q = s.filters.q.trim().toLowerCase();
      const filtered = s.paints
        .filter((p) => {
          if (s.filters.type !== "all" && p.type !== s.filters.type) return false;
          if (s.filters.brand !== "all" && (p.brand ?? "") !== s.filters.brand) return false;
          if (s.filters.system !== "all" && (p.system ?? "unknown") !== s.filters.system)
            return false;
          if (!q) return true;
          return (
            contains(p.name, q) ||
            contains(p.brand, q) ||
            contains(p.color, q) ||
            contains(p.note, q) ||
            contains(p.barcode, q)
          );
        })
        .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
      return filtered;
    }),
  );

export const useBrands = () =>
  usePaintsStore(
    useShallow((s) => {
      const set = new Set<string>();
      for (const p of s.paints) if (p.brand?.trim()) set.add(p.brand.trim());
      return Array.from(set).sort((a, b) => a.localeCompare(b, "ja"));
    }),
  );

export const usePinnedBrands = () =>
  usePaintsStore(
    useShallow((s) => {
      const counts = new Map<string, number>();
      for (const p of s.paints) {
        const b = (p.brand ?? "").trim();
        if (!b) continue;
        counts.set(b, (counts.get(b) ?? 0) + 1);
      }
      return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"))
        .slice(0, 6)
        .map(([name]) => name);
    }),
  );
