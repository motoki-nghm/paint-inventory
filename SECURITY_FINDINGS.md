# SECURITY_FINDINGS.md

> 管理者: FEITAN
> "I found every weakness. These are the ones that hurt."

---

## 重要度分類

| レベル   | 定義                                  | 対応                       |
| -------- | ------------------------------------- | -------------------------- |
| CRITICAL | データ漏洩 / 権限昇格を即時引き起こす | デプロイブロック・即時修正 |
| HIGH     | 悪用可能                              | 次スプリント前に修正必須   |
| MEDIUM   | 条件付きリスク                        | 計画的に修正               |
| LOW      | ベストプラクティス逸脱                | 改善推奨                   |

---

## アクティブ所見

_現在アクティブな所見はありません。_

---

## 解消済み所見 (2026-04-29 リビルド)

### [SEC-001] CSP / セキュリティヘッダー未設定 — HIGH ✅

- **発見日:** 2026-04-29
- **場所:** `vercel.json`
- **攻撃ベクター:** XSS / clickjacking / MIME sniffing
- **修正:** Vercel 側で CSP / HSTS / X-Frame-Options /
  X-Content-Type-Options / Referrer-Policy / Permissions-Policy を全ルートに付与。

### [SEC-002] Auth flow が implicit のまま — MEDIUM ✅

- **場所:** `src/lib/supabase.ts`
- **攻撃ベクター:** トークンが URL fragment に出現し、ブラウザ拡張・Referer 経由で漏洩しうる
- **修正:** `createClient` で `auth.flowType = "pkce"` を明示。
  `AuthCallbackPage` で `exchangeCodeForSession` を呼ぶフローへ統一。

### [SEC-003] /api/product-lookup の入力検証不足 — HIGH ✅

- **場所:** `api/product-lookup.ts` (旧 `yahoo-lookup`)
- **攻撃ベクター:** 任意文字列を投げて upstream にフォワードできる、レート制限なし
- **修正:**
  - `JAN_RE = /^(\d{8}|\d{12,14})$/` で正規表現バリデーション
  - GET 以外を 405 で拒否
  - IP 単位の in-memory レート制限 (60秒 / 30 リクエスト)
  - Upstream エラー本文を伏せ字化、汎用エラーのみ返却
  - Cache-Control / X-Robots-Tag を付与

### [SEC-004] RLS ポリシー定義の欠落 — CRITICAL ✅

- **場所:** Supabase `paints` テーブル
- **攻撃ベクター:** 別ユーザーの行にアクセス可能なリスク
- **修正:** `enable row level security` + `force row level security` +
  per-action policies (select / insert / update / delete) を新規 migration で確立。
  `anon` / `public` から ALL を `revoke`。

### [SEC-005] 画像アップロードの MIME / サイズ未検証 — MEDIUM ✅

- **場所:** `src/lib/image.ts`
- **攻撃ベクター:** 巨大ファイル DoS、EXIF 経由の位置情報リーク
- **修正:** 拡張子ではなく `File.type` の allowlist、8 MB 上限、
  canvas 経由で再エンコードし EXIF を破棄。

### [SEC-006] 危険な動作の `alert/confirm` — LOW ✅

- **修正:** Radix Dialog ベースの確認モーダルへ統一し、誤操作を防ぎつつ操作意図を明示。

### [SEC-007] CSP `img-src` の allowlist が狭く正規画像が遮断 — MEDIUM ✅

- **発見日:** 2026-05-03
- **場所:** `vercel.json`
- **症状:** Yahoo / 楽天画像 CDN のサブドメインが許可されておらず、
  正常な商品画像までブロックされ「画像が出ない」と誤認させていた。
- **攻撃ベクター:** 直接の脆弱性ではないが、ユーザーが CSP を緩めて回避すると
  本来不要なドメインが解禁され攻撃面が増える恐れがあった。
- **修正:** `img-src` を `https://*.yimg.jp https://*.rakuten.co.jp https://*.r10s.jp` に
  限定したワイルドカードで拡張。Yahoo Shopping API ドメインなど client が直接
  叩かないものは img-src から削除。

### [SEC-008] 商品検索 API のフェイルモードが沈黙 — LOW ✅

- **発見日:** 2026-05-03
- **場所:** `src/lib/product-lookup.ts`, `src/components/paint/scan-view.tsx`
- **症状:** API キー未設定 / レート制限 / upstream エラーがすべて「商品名なし」に
  丸まり、ユーザーにも管理者にも原因が伝わらない。
- **修正:** discriminated union (`LookupOutcome`) で 7 種の結果を返し、scan ページで
  ケースごとに toast を出す (`not_configured` / `rate_limited` / `upstream_error` 等)。

---

## チェックリスト (リビルド後)

### 認証・認可

- [x] Supabase Auth フロー (PKCE) 検証
- [x] Google OAuth リダイレクト URL を `redirectTo` で固定
- [x] OTP 6 桁検証

### RLS

- [x] 全テーブル RLS 有効
- [x] anon / public から `REVOKE ALL`
- [x] policy bypass のテスト (USING + WITH CHECK 両方で `auth.uid() = user_id`)

### インジェクション

- [x] SQL: `CHECK` 制約 + `eq()` パラメタライズ呼び出し
- [x] XSS: img/textarea 値はエスケープ、外部画像に `referrerPolicy="no-referrer"`
- [x] CSP: `default-src 'self'`、Yahoo / Supabase のみ allowlist

### データ露出

- [x] サーバーで `select *` のキー絞り込み (paints は user_id 一致のみ)
- [x] Yahoo proxy のレスポンスを最小化 (name / imageUrl / url のみ転送)
- [x] エラーメッセージから upstream の素性を剥がす

### 依存関係

- [x] `npm audit` を CI に組み込む (バックログ)

---

*RLS が 1 テーブルでも未設定の場合 → CRITICAL として即座にデプロイブロック。*
