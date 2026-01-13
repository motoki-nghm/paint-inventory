export default async function handler(req, res) {
  try {
    const appid = process.env.YAHOO_APP_ID; // ← Vercelの環境変数に入れる
    if (!appid) return res.status(500).json({ ok: false, error: "YAHOO_APP_ID is not set" });

    const barcode = String(req.query.barcode || "").trim();
    if (!barcode) return res.status(400).json({ ok: false, error: "barcode is required" });

    // Yahoo!ショッピング 商品検索(v3)（jan_codeで検索） :contentReference[oaicite:1]{index=1}
    const url = new URL("https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch");
    url.searchParams.set("appid", appid);
    url.searchParams.set("jan_code", barcode);
    url.searchParams.set("results", "1");
    url.searchParams.set("image_size", "300"); // exImageを使う（ある程度大きめ）

    const r = await fetch(url.toString());
    if (!r.ok) return res.status(502).json({ ok: false, error: `Yahoo API error: ${r.status}` });

    const data = await r.json();
    const hit = Array.isArray(data?.hits) ? data.hits[0] : null;

    const name = hit?.name || "";
    // 画像URLは exImage があればそれ優先。なければ image.medium などにフォールバック :contentReference[oaicite:2]{index=2}
    const imageUrl = hit?.exImage?.url || hit?.image?.medium || hit?.image?.small || "";
    const itemUrl = hit?.url || "";

    if (!name) return res.status(200).json({ ok: true, found: false });

    return res.status(200).json({
      ok: true,
      found: true,
      name,
      imageUrl,
      url: itemUrl,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || "unknown error" });
  }
}
