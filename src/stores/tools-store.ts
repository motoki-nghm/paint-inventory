import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { contains, now, uuid } from "@/lib/utils";
import {
  deleteTool as deleteOnServer,
  fetchTools,
  upsertTool as upsertOnServer,
} from "@/lib/tool-repo";
import type { Tool, ToolDraft, ToolFilters } from "@/types/tool";
import { DEFAULT_TOOL_FILTERS } from "@/types/tool";

interface ToolsState {
  tools: Tool[];
  filters: ToolFilters;
  loaded: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  reload: () => Promise<void>;
  add: (input: ToolDraft) => Tool;
  update: (id: string, patch: Partial<ToolDraft>) => void;
  remove: (id: string) => void;
  setFilters: (next: ToolFilters) => void;
  getById: (id: string) => Tool | null;
}

function pushOptimisticToServer(tool: Tool) {
  void (async () => {
    try {
      await upsertOnServer(tool);
    } catch (err) {
      console.warn("[tools] upsert failed", err);
    }
  })();
}

export const useToolsStore = create<ToolsState>((set, get) => ({
  tools: [],
  filters: DEFAULT_TOOL_FILTERS,
  loaded: false,
  error: null,

  async initialize() {
    if (get().loaded) return;
    try {
      const cloud = await fetchTools();
      set({ tools: cloud, loaded: true, error: null });
    } catch (err) {
      console.warn("[tools] cloud load failed", err);
      set({ tools: [], loaded: true, error: null });
    }
  },

  async reload() {
    try {
      const cloud = await fetchTools();
      set({ tools: cloud, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "再読み込みに失敗しました";
      set({ error: msg });
    }
  },

  add(input) {
    const t = now();
    const item: Tool = {
      id: uuid(),
      createdAt: t,
      updatedAt: t,
      name: String(input.name ?? "").trim(),
      brand: String(input.brand ?? "").trim() || undefined,
      category: input.category ?? "other",
      condition: input.condition ?? "good",
      qty: typeof input.qty === "number" ? input.qty : undefined,
      location: String(input.location ?? "").trim() || undefined,
      note: String(input.note ?? "").trim() || undefined,
      purchasedAt: input.purchasedAt || undefined,
      imageDataUrl: input.imageDataUrl || undefined,
      imageUrl: input.imageUrl || undefined,
    };
    if (!item.name) {
      set({ error: "工具名は必須です" });
      return item;
    }
    set({ tools: [item, ...get().tools], error: null });
    pushOptimisticToServer(item);
    return item;
  },

  update(id, patch) {
    let updated: Tool | null = null;
    const next = get().tools.map((p) => {
      if (p.id !== id) return p;
      const merged: Tool = {
        ...p,
        ...patch,
        name: String(patch.name ?? p.name).trim(),
        brand: ((patch.brand ?? p.brand) ?? "").trim() || undefined,
        location: ((patch.location ?? p.location) ?? "").trim() || undefined,
        note: ((patch.note ?? p.note) ?? "").trim() || undefined,
        purchasedAt: patch.purchasedAt ?? p.purchasedAt,
        qty: typeof patch.qty === "number" ? patch.qty : p.qty,
        category: patch.category ?? p.category,
        condition: patch.condition ?? p.condition,
        imageDataUrl: patch.imageDataUrl ?? p.imageDataUrl,
        imageUrl: patch.imageUrl ?? p.imageUrl,
        updatedAt: now(),
      };
      updated = merged;
      return merged;
    });
    set({ tools: next });
    if (updated) pushOptimisticToServer(updated);
  },

  remove(id) {
    const next = get().tools.filter((p) => p.id !== id);
    set({ tools: next });
    void (async () => {
      try {
        await deleteOnServer(id);
      } catch (err) {
        console.warn("[tools] delete failed", err);
      }
    })();
  },

  setFilters(next) {
    set({ filters: next });
  },

  getById(id) {
    return get().tools.find((p) => p.id === id) ?? null;
  },
}));

export const useFilteredTools = () =>
  useToolsStore(
    useShallow((s) => {
      const q = s.filters.q.trim().toLowerCase();
      return s.tools
        .filter((t) => {
          if (s.filters.category !== "all" && t.category !== s.filters.category) return false;
          if (s.filters.condition !== "all" && t.condition !== s.filters.condition) return false;
          if (!q) return true;
          return (
            contains(t.name, q) ||
            contains(t.brand, q) ||
            contains(t.note, q) ||
            contains(t.location, q)
          );
        })
        .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    }),
  );
