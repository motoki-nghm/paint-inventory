# PROGRESS.md — Weekly Summary

> 管理者: BISCUIT | 報告先: GON
> "Everything's in order. Don't embarrass me."

---

## Week 2026-W18 (2026-04-27 〜 2026-05-03)

### 完了

- ✅ `claude/rebuild-app-ui-security-Umquz` ブランチでアプリ全面リビルド
- ✅ TypeScript / Zustand / Zod / sonner / Radix Dialog 導入
- ✅ デザイントークンと UI primitives を `cva` ベースで再構築
- ✅ ScanView を一新 (オーバーレイ枠 + ライト操作 + ステータスバッジ)
- ✅ Supabase Auth を PKCE に明示固定し、`AuthCallbackPage` を堅牢化
- ✅ Supabase migration `20260429000000_init_paints.sql` で RLS 完備
- ✅ `/api/yahoo-lookup` をハードニング (検証 / レート制限 / エラー伏せ)
- ✅ Vercel 側 CSP / HSTS / Permissions-Policy を全ルートに付与
- ✅ ドキュメント (README / SECURITY / SECURITY_FINDINGS / REVIEW_LOG / TASKS / DECISIONS) 更新

### 進行中

- 🔵 ビルド・型・lint の最終グリーン確認 (KNUCKLE)

### ブロック中

- なし

### リスク

- 画像 data URL の DB 保存は短期 OK・長期 NG。Supabase Storage 移行を次スプリントの最優先に。
- in-memory レートリミッタの限界。スケール時は Upstash Redis 等に置換。

### 来週の予定

- [ ] 画像を Supabase Storage に移管
- [ ] Vitest による store / validators の単体テスト
- [ ] Playwright で E2E ハッピーパス
- [ ] `npm audit` を CI に組み込む

---

## Week 2026-W16 (2026-04-13 〜 2026-04-19)

### 完了

- ✅ チームセットアップ (CLAUDE.md + ドキュメント雛形)

### 進行中

- なし

### ブロック中

- なし

### リスク

- なし (初期化フェーズ)

### 来週の予定

- Phase 1 タスク開始

---

*週次更新は BISCUIT が実施。GON への報告はこのファイルを参照。*
