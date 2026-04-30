# SECURITY_FINDINGS.md — Security Findings Log

> 管理者: FEITAN (Security Agent)
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

_現在アクティブな所見はありません_

---

## 所見テンプレート

```
## [SEC-XXX] タイトル

- **重要度:** CRITICAL / HIGH / MEDIUM / LOW
- **発見日:** YYYY-MM-DD
- **発見者:** FEITAN
- **場所:** ファイルパス:行番号
- **攻撃ベクター:** どのように悪用されるか
- **影響:** 何が起こるか
- **推奨対応:** 具体的な修正方法
- **ステータス:** open / in_progress / resolved
- **解消日:** YYYY-MM-DD (解消時)
```

---

## セキュリティチェックリスト

### 認証・認可
- [ ] Supabase Auth フロー検証 (PKCE 推奨)
- [ ] JWT トークン有効期限設定
- [ ] セッション管理 (storageKey 固定 / autoRefresh)
- [ ] OAuth redirectTo を明示固定

### RLS (Row Level Security)
- [ ] 全テーブルに RLS ポリシー適用 (`force row level security`)
- [ ] ポリシーのバイパス不可確認 (USING + WITH CHECK 両方で auth.uid() 一致)
- [ ] anon ロールから REVOKE ALL

### インジェクション
- [ ] SQL: パラメタライズ + CHECK 制約
- [ ] XSS: 入力サニタイズ・CSP
- [ ] プロンプトインジェクション (LLM 連携時)

### データ露出
- [ ] 過剰なデータフェッチ防止
- [ ] 機密カラムの RLS 保護
- [ ] API レスポンスの最小化
- [ ] エラーメッセージから upstream 情報を伏せる

### セキュリティヘッダー
- [ ] Content-Security-Policy (default-src 'self' 起点で allowlist)
- [ ] Strict-Transport-Security (HSTS)
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY (or CSP frame-ancestors 'none')
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy で不要な API を無効化

### 画像・ファイルアップロード
- [ ] MIME allowlist
- [ ] サイズ上限
- [ ] canvas 経由の再エンコードで EXIF 剥がし

### 依存関係
- [ ] `npm audit` を CI に組み込み
- [ ] 既知 CVE の確認 (週次)

### API エンドポイント
- [ ] HTTP メソッド制限 (GET only など)
- [ ] 入力フォーマット検証 (regex / Zod)
- [ ] レート制限 (IP 単位 or トークン単位)
- [ ] Cache-Control 適切化

---

*RLS が 1 テーブルでも未設定の場合 → CRITICAL 所見として即座にデプロイをブロックすること。*
