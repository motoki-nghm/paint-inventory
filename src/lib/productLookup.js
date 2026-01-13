import { loadState } from "@/lib/storage";

/**
 * barcode -> { name, imageUrl, source } or null
 * 優先順位:
 * 1) ローカル（過去に保存したJAN一致）
 * 2) Yahoo（/api/yahoo-lookup）
 * 3) null（＝手入力）
 */
export async function productLookup(barcode) {
  const code = String(barcode || "").trim();
  if (!code) return null;

  // 1) ローカル辞書（保存済みデータ）を優先
  try {
    const state = await loadState();
    const hit = state?.paints?.find((p) => String(p?.barcode || "").trim() === code);

    if (hit?.name?.trim()) {
      return {
        name: hit.name.trim(),
        imageUrl: hit.imageUrl || "",
        source: "local",
      };
    }
  } catch {
    // ローカル読み取り失敗は無視して次へ
  }

  // 2) Yahoo（Vercel Function経由）
  try {
    const res = await fetch(`/api/yahoo-lookup?barcode=${encodeURIComponent(code)}`);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data?.ok || !data?.found) return null;

    return {
      name: data.name || "",
      imageUrl: data.imageUrl || "",
      source: "Yahoo Shopping",
    };
  } catch {
    return null;
  }
}
