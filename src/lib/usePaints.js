import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_FILTERS, normalizeColor, DEFAULT_COLOR } from "@/lib/db";
import { loadState, saveState } from "@/lib/storage";
import { contains, now } from "@/lib/utils";
import { getSessionUser, fetchPaintsSupabase, upsertPaintSupabase, deletePaintSupabase } from "@/lib/paintRepoSupabase";

const AUTO_SYNC_KEY = "autoSync";
const LAST_SYNC_KEY = "lastSyncedAt";

function loadBool(key, def) {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return def;
    return v === "1";
  } catch {
    return def;
  }
}

function saveBool(key, v) {
  try {
    localStorage.setItem(key, v ? "1" : "0");
  } catch {}
}
function loadNum(key, def) {
  try {
    const v = localStorage.getItem(key);
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) ? n : def;
  } catch {
    return def;
  }
}
function saveNum(key, v) {
  try {
    localStorage.setItem(key, String(v));
  } catch {}
}

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

// Supabase row へ変換（DBのカラム名 snake_case に合わせる）
function toRow(p, userId) {
  return {
    id: p.id,
    user_id: userId,

    name: p.name ?? "",
    brand: p.brand ?? null,
    type: p.type ?? null,
    system: p.system ?? null,
    color: p.color ?? null,
    note: p.note ?? null,
    capacity: p.capacity ?? null,
    qty: typeof p.qty === "number" ? p.qty : null,
    barcode: p.barcode ?? null,
    purchased_at: p.purchasedAt ? p.purchasedAt : null, // "" は送らない
    image_url: p.imageUrl ?? null,
    image_data_url: p.imageDataUrl ?? null,
  };
}

export function usePaints() {
  const [syncing, setSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => loadNum(LAST_SYNC_KEY, 0));
  const [autoSync, _setAutoSync] = useState(() => loadBool(AUTO_SYNC_KEY, true));

  const [paints, setPaints] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loaded, setLoaded] = useState(false);

  // 自動同期デバウンス
  const autoTimerRef = useRef(null);

  const setAutoSync = (v) => _setAutoSync(!!v);

  // 初期ロード：ログインしてればクラウド、ダメならローカル
  useEffect(() => {
    (async () => {
      try {
        const user = await getSessionUser();

        // ✅ ログイン中：クラウド優先
        if (user) {
          const cloud = await fetchPaintsSupabase();

          // ✅ ここで正規化（クラウド由来でも色を揃える）
          const normalizedCloud = (cloud || []).map((p) => ({
            system: "unknown",
            ...p,
            color: normalizeColor(p.color),
          }));

          setPaints(normalizedCloud);
          setLoaded(true);
          return;
        }
      } catch {
        // Supabaseが落ちててもローカルへフォールバック
      }

      // ✅ 未ログイン：ローカル
      const state = await loadState();
      const normalizedLocal = (state.paints || []).map((p) => ({
        system: "unknown",
        ...p,
        color: normalizeColor(p.color),
      }));

      setPaints(normalizedLocal);
      setLoaded(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ローカル永続化：未ログイン時だけ
  useEffect(() => {
    if (!loaded) return;

    (async () => {
      const user = await getSessionUser();
      if (user) return;
      await saveState(paints);
    })();
  }, [paints, loaded]);

  // トグル等の永続化
  useEffect(() => saveBool(AUTO_SYNC_KEY, autoSync), [autoSync]);
  useEffect(() => saveNum(LAST_SYNC_KEY, lastSyncedAt), [lastSyncedAt]);

  // 未同期件数：lastSyncedAt より新しい updatedAt を持つもの
  const unsyncedCount = useMemo(() => {
    if (!paints?.length) return 0;
    return paints.filter((p) => (p.updatedAt ?? 0) > lastSyncedAt).length;
  }, [paints, lastSyncedAt]);

  // 🔥 手動同期：全件 upsert（chunk対応）
  async function syncNow({ supabase, user }) {
    if (!supabase || !user) throw new Error("not logged in");
    if (syncing) return; // ✅ 二重押し防止

    setSyncing(true);

    try {
      // ✅ uuidじゃないidが混ざると落ちるので弾く（暫定）
      const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      const payload = paints
        .filter((p) => uuidRe.test(String(p.id || ""))) // ✅ ここ
        .map((p) => ({
          id: p.id,
          user_id: user.id,

          name: p.name ?? "",
          brand: p.brand ?? null,
          type: p.type ?? null,
          system: p.system ?? null,
          color: p.color ?? null,
          note: p.note ?? null,
          capacity: p.capacity ?? null,
          qty: typeof p.qty === "number" ? p.qty : null,
          barcode: p.barcode ?? null,
          purchased_at: p.purchasedAt ?? null,
          image_url: p.imageUrl ?? null,
          image_data_url: p.imageDataUrl ?? null,
        }));

      // 0件でも成功扱い
      if (payload.length === 0) {
        setLastSyncedAt(Date.now());
        return;
      }

      // ✅ 200件ずつ（安全）
      const chunkSize = 200;
      for (let i = 0; i < payload.length; i += chunkSize) {
        const chunk = payload.slice(i, i + chunkSize);
        const { error } = await supabase.from("paints").upsert(chunk, { onConflict: "id" });
        if (error) throw error;
      }

      setLastSyncedAt(Date.now());
      // eslint-disable-next-line no-useless-catch
    } catch (e) {
      throw e;
    } finally {
      setSyncing(false);
    }
  }

  // ✅ 自動同期：autoSync ON かつログインしてる時だけ、軽くデバウンスして走らせる
  useEffect(() => {
    if (!loaded) return;
    if (!autoSync) return;
    if (syncing) return;

    // 「未同期が無いなら何もしない」
    if (unsyncedCount === 0) return;

    // タイマー再セット
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    autoTimerRef.current = setTimeout(async () => {
      try {
        const user = await getSessionUser();
        if (!user) return; // 未ログインならしない
        // paintRepoSupabase内の supabase client を使って “まとめ同期” する方針でもOKだけど、
        // いまは Header から渡す設計なので、ここでは何もしない（Header側で呼ぶ方式に合わせる）
      } catch {}
    }, 800);

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    };
  }, [paints, loaded, autoSync, syncing, unsyncedCount]);

  const brands = useMemo(() => {
    const s = new Set();
    for (const p of paints) if (p.brand?.trim()) s.add(p.brand.trim());
    return Array.from(s).sort((a, b) => a.localeCompare(b, "ja"));
  }, [paints]);

  const pinnedBrands = useMemo(() => {
    const counts = new Map();
    for (const p of paints) {
      const b = (p.brand || "").trim();
      if (!b) continue;
      counts.set(b, (counts.get(b) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"))
      .slice(0, 6)
      .map(([name]) => name);
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
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  }, [paints, filters]);

  function getById(id) {
    return paints.find((p) => p.id === id) ?? null;
  }

  function normalizeBarcode(v) {
    return String(v ?? "").trim();
  }
  function normalizeQty(v) {
    if (typeof v === "number") return Number.isFinite(v) ? v : 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  function add(input) {
    const code = normalizeBarcode(input?.barcode);
    const hasCode = !!code;
    // ✅ 既存判定：同じバーコードがあるか？
    if (hasCode) {
      const existing = paints.find((p) => normalizeBarcode(p?.barcode) === code);

      if (existing) {
        const ok = window.confirm(
          `このバーコードは既に登録済みです。\n\n` + `「OK」= 所持数を +1\n` + `「キャンセル」= 登録しない`,
        );

        if (!ok) {
          // ✅ キャンセル：登録しない（呼び出し側で null を見て reset など）
          return null;
        }

        // ✅ OK：qty を +1
        const nextQty = normalizeQty(existing.qty) + 1;
        update(existing.id, { qty: nextQty });

        return existing; // 既存を返す（呼び出し側は一覧へ戻す等）
      }
    }

    const t = now();

    const name = String(input.name ?? "").trim();
    const barcode = String(input.barcode ?? "").trim(); // ✅ trimして扱う
    const qtyInput = typeof input.qty === "number" ? input.qty : undefined;

    if (!name) {
      // ここは PaintForm 側で弾いてる想定だけど保険
      return null;
    }

    // ✅ 重要：バーコードが「空のとき」は重複判定しない（空同士が全部重複扱いになるのを防ぐ）
    if (barcode) {
      const existing = paints.find((p) => String(p.barcode ?? "").trim() === barcode);
      if (existing) {
        const ok = confirm(
          `このバーコードは既に登録されています。\n\n「はい」→ 既存の所持数を +1\n「いいえ」→ キャンセル`,
        );
        if (!ok) return null;

        // ✅ qty を +1（未設定なら 1 にする）
        const prevQtyNum = Number(existing.qty);
        const nextQty = (Number.isFinite(prevQtyNum) ? prevQtyNum : 0) + 1;

        update(existing.id, { qty: nextQty });
        return existing;
      }
    }

    const item = {
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

      barcode: barcode || undefined,
      purchasedAt: input.purchasedAt || undefined,

      imageDataUrl: input.imageDataUrl || undefined,
      imageUrl: input.imageUrl || undefined,
    };

    setPaints((prev) => [item, ...prev]);

    // ✅ ログイン中は upsert（失敗してもローカルは登録される）
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

        const next = {
          ...p,
          ...patch,

          name: String(patch.name ?? p.name).trim(),
          brand: (patch.brand ?? p.brand)?.trim() || undefined,

          // ✅ ここが重要：更新でも必ず正規化
          color: normalizeColor(patch.color ?? p.color),

          note: (patch.note ?? p.note)?.trim() || undefined,
          capacity: (patch.capacity ?? p.capacity)?.trim() || undefined,
          barcode: (patch.barcode ?? p.barcode)?.trim() || undefined,
          purchasedAt: patch.purchasedAt ?? p.purchasedAt,
          qty: typeof patch.qty === "number" ? patch.qty : p.qty,
          type: patch.type ?? p.type,
          imageDataUrl: patch.imageDataUrl ?? p.imageDataUrl,
          imageUrl: patch.imageUrl ?? p.imageUrl,
          system: patch.system ?? p.system,
          updatedAt: now(),
        };

        // ✅ update後の “確定した next” を Supabase に流す
        void (async () => {
          try {
            const user = await getSessionUser();
            if (!user) return;
            await upsertPaintSupabase(next);
          } catch (e) {
            console.warn("supabase upsert failed (update)", e);
          }
        })();

        return next;
      }),
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

  function findByBarcode(code) {
    const key = String(code ?? "").trim();
    if (!key) return null;
    return paints.find((p) => String(p.barcode ?? "").trim() === key) ?? null;
  }

  return {
    paints,
    filtered,
    filters,
    setFilters,
    brands,
    pinnedBrands,
    loaded,
    getById,
    findByBarcode,
    add,
    update,
    remove,
    replaceAll,
    syncing,
    lastSyncedAt,
    unsyncedCount,
    autoSync,
    setAutoSync,
    syncNow,
  };
}
