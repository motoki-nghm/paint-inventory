# REVIEW_LOG.md

> 管理者: KNUCKLE (QA / Code Reviewer)
> "Debt logged. Here's what you owe — and how to pay it back."

---

## 分類

| マーク       | 意味                       |
| ------------ | -------------------------- |
| 🔴 BLOCKER   | マージ不可・即時修正       |
| 🟡 SHOULD FIX | 次スプリントまでに修正推奨 |
| 🟢 SUGGESTION | 改善提案                   |

---

## [REV-001] フルリビルド全体

- **レビュー日:** 2026-04-29
- **対象:** branch `claude/rebuild-app-ui-security-Umquz` 全差分

### 🔴 BLOCKER

_なし_

### 🟡 SHOULD FIX

- **画像 data URL の DB 保存**: 現状は `paints.image_data_url` (text) に
  base64 をそのまま入れる旧仕様を踏襲している。1 件あたり数百 KB〜数 MB に
  なりうるため、Supabase Storage に逃がし `image_url` のみ保持するのが望ましい。
- **同期戦略**: 自動同期はオンライン前提の即時 upsert のみ。オフライン書き込み
  キューを設けると体験が安定する。

### 🟢 SUGGESTION

- 一覧の件数が増えたら仮想スクロール (`@tanstack/react-virtual`) を検討。
- E2E テストは Playwright で `login → add → list → edit → delete` の
  ハッピーパスから書き始めると ROI が高い。
- ストアは `add()` のとき duplicate を呼び出し側へ返すユニオン型で表現したが、
  画面によっては toast で通知すると統一感が増す。

### 技術的負債トラッカー

| ID    | 場所                            | コスト | 理由                                                       | 提案修正                                     |
| ----- | ------------------------------- | ------ | ---------------------------------------------------------- | -------------------------------------------- |
| DEBT1 | `src/types/paint.ts:image_data_url` | HIGH   | 大きい base64 を行に格納するとクラウド DB の I/O が太る   | Supabase Storage への移管 + 公開 URL 参照    |
| DEBT2 | `api/product-lookup.ts` rate limiter | MEDIUM | in-memory のため複数インスタンスで共有されない          | Upstash Redis 等の分散レートリミッタへ置換  |
| DEBT3 | テスト未整備                       | MEDIUM | 回帰検出が手動                                            | Vitest + Playwright をミニマム導入           |

### 総評

**承認: CONDITIONAL** — ビルド・型・lint がグリーンで、本ドキュメントの
SHOULD FIX を次スプリントに積めば release 可。
