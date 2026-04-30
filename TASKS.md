# TASKS.md — Sprint Board

> 管理者: BISCUIT | 最終更新: 2026-04-29
> "Everything's in order. Don't embarrass me."

---

## ステータス凡例

| マーク | 意味                          |
| ------ | ----------------------------- |
| ⬜     | pending — 未着手              |
| 🔵     | in_progress — 作業中          |
| ✅     | done — 完了                   |
| 🔴     | blocked — ブロック中          |

---

## Sprint: Rebuild — UI/UX overhaul + 2026 security baseline

| ID   | エージェント | タスク                                            | ステータス |
| ---- | ----------- | ------------------------------------------------- | ---------- |
| T101 | KOMUGI      | デザイントークン (色 / 余白 / radius / 影) 再定義 | ✅         |
| T102 | KILLUA      | UI primitives 再構築 (cva ベース)                 | ✅         |
| T103 | KILLUA      | Layout (AppShell / Header / BottomNav / Footer)   | ✅         |
| T104 | KILLUA      | Paint ドメインコンポーネント                      | ✅         |
| T105 | KILLUA      | ScanView リフレッシュ (オーバーレイ + ライト)    | ✅         |
| T106 | KURAPIKA    | Zustand store + バリデーション (Zod)              | ✅         |
| T107 | KURAPIKA    | 画像アップロードの正規化 / EXIF 剥がし            | ✅         |
| T108 | CHROLLO     | Supabase migration: paints table + RLS            | ✅         |
| T109 | FEITAN      | /api/yahoo-lookup ハードニング                    | ✅         |
| T110 | FEITAN      | CSP / セキュリティヘッダー (vercel.json)          | ✅         |
| T111 | BISCUIT     | ドキュメント更新 (README / SECURITY / TASKS …)    | ✅         |
| T112 | KNUCKLE     | ビルド・型・lint 通過確認                         | 🔵         |

---

## 完了タスク

- 旧 src/ の段階的廃止と新フォルダ構成への移行
- TypeScript / Zustand / Zod / sonner / Radix Dialog 導入
- Supabase Auth を PKCE フローへ明示固定
- 画像アップロード: 自動ダウンスケール + JPEG 再エンコード

---

## バックログ

- ⬜ 画像を Supabase Storage に逃がす (data URL → 公開バケット URL)
- ⬜ 一覧の仮想スクロール (1,000 件超想定)
- ⬜ オフライン書き込みキュー (現状はオンライン前提の即時同期)
- ⬜ E2E テスト (Playwright)

*ステータス変更は各エージェントが自己申告。Pro 枠を意識してスポーン数は最小限。*
