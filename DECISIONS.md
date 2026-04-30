# DECISIONS.md — Architecture Decision Log

> 管理者: BISCUIT | 形式: ADR (Architecture Decision Record)

---

## [ADR-001] エージェントチームの採用

- **日付:** 2026-04-18
- **ステータス:** accepted
- **決定者:** GON
- **コンテキスト:** 複数の専門領域 (Frontend / Backend / DB / Security / QA) を並列で
  進める必要がある。
- **決定内容:** HUNTER×HUNTER ベースの 8〜10 エージェントチーム構成を採用。
- **理由:** 役割と行動原則がキャラクターで明確化され、ハンドオフが速い。
- **トレードオフ:** 単一エージェントより調整コストが増えるが、品質と速度で上回る。

---

## [ADR-002] 技術スタック

- **日付:** 2026-04-18
- **ステータス:** accepted
- **決定者:** KURAPIKA + CHROLLO
- **決定内容:** React 19 + Vite + TypeScript + TailwindCSS + Zustand + Zod
  + Supabase + Sonner + Radix Primitives.
- **理由:** Supabase は Auth / DB / RLS / Storage を一元管理可能。Zustand は
  selector で再描画が最小化される。Zod で境界バリデーションを統一。
- **トレードオフ:** Supabase ベンダーロック。ポートフォリオ用途なら許容。

---

## [ADR-003] フルリビルド

- **日付:** 2026-04-29
- **ステータス:** accepted
- **決定者:** GON / 全員
- **コンテキスト:** UI/UX を抜本的に作り直したいというオーナーリクエスト。
  既存実装は機能はそろうものの、型なし / 状態管理が context のみ /
  alert/confirm 多用 / セキュリティヘッダーなし、と複数の負債を抱えていた。
- **決定内容:** `src/` と `api/` を白紙化し、新フォルダ構成 + TypeScript +
  Zustand + Zod に再構築。要件はすべて踏襲。
- **理由:** 部分修正より UI/UX 一貫性を取りに行く方が成果物の納得感が高い。
- **トレードオフ:** 差分が大きく、コードレビューに時間がかかる。

---

## [ADR-004] Supabase Auth を PKCE に明示固定

- **日付:** 2026-04-29
- **ステータス:** accepted
- **決定者:** FEITAN
- **コンテキスト:** SPA でトークンが URL fragment に晒されるリスクを排除したい。
- **決定内容:** `createClient` で `auth.flowType = "pkce"` を明示。
- **理由:** PKCE は SPA における推奨 (RFC 8252)。Implicit flow は非推奨。
- **トレードオフ:** リダイレクト先で `exchangeCodeForSession` の呼び出しが必要。
  → `AuthCallbackPage` で対応済み。

---

## [ADR-005] CSP を Vercel ヘッダーで配信

- **日付:** 2026-04-29
- **ステータス:** accepted
- **決定者:** FEITAN
- **決定内容:** `vercel.json` の `headers` で全ルートに CSP / HSTS /
  Referrer-Policy / Permissions-Policy / X-Content-Type-Options / X-Frame-Options
  を強制。CSP は Supabase / Yahoo Shopping CDN を `connect-src` / `img-src` に許可。
- **理由:** メタタグでは `frame-ancestors` 等が効かない。レスポンスヘッダー側で
  扱うのが正攻法。
- **トレードオフ:** Vercel デプロイ前提のロックイン。

---

## [ADR-006] 画像はクライアントで縮小して JPEG 化

- **日付:** 2026-04-29
- **ステータス:** accepted
- **決定者:** KURAPIKA
- **決定内容:** アップロード時に `<canvas>` で 1280px に縮小し、quality 0.82 の
  JPEG として data URL 化。
- **理由:** EXIF を剥がせる (位置情報リーク防止)、転送量と DB サイズを抑制、
  Supabase の payload 上限に余裕を持たせる。
- **トレードオフ:** 画質の絶対値は劣化。塗料の色味判別には十分。

---

*過去の決定は絶対に削除しない。新規は追記。*
