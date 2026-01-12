const UPCITEMDB_KEY = import.meta.env.VITE_UPCITEMDB_KEY;

async function lookupUpcItemDb(barcode) {
  if (!UPCITEMDB_KEY) return null;

  const url = `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(barcode)}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      key: UPCITEMDB_KEY,
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const title = data?.items?.[0]?.title;
  if (title && title.trim()) return { name: title.trim(), source: "upcitemdb" };
  return null;
}

async function lookupOpenFoodFacts(barcode) {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const name = data?.product?.product_name || data?.product?.product_name_en || data?.product?.generic_name;
  if (name && name.trim()) return { name: name.trim(), source: "openfoodfacts" };
  return null;
}

export async function productLookup(barcode) {
  const code = String(barcode ?? "").trim();
  if (!code) return null;

  try {
    const a = await lookupUpcItemDb(code);
    if (a) return a;
  } catch {
    // fallback
  }

  try {
    const b = await lookupOpenFoodFacts(code);
    if (b) return b;
  } catch {
    // fallback
  }

  return null;
}
