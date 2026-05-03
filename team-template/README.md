# HUNTER×HUNTER Agent Team — Reusable Template

> このフォルダをまるごと新しいプロジェクトの直下にコピーすれば、同じチームで動かせます。

## 構成

```
team-template/
  README.md              ← このファイル (使い方)
  CLAUDE.md              ← エージェントチーム定義 (Claude Code が参照)
  TASKS.md               ← スプリントタスクボード (BISCUIT 管理)
  DECISIONS.md           ← アーキテクチャ決定ログ ADR (BISCUIT 管理)
  BLOCKERS.md            ← アクティブブロッカー (BISCUIT 管理)
  PROGRESS.md            ← 週次進捗 (BISCUIT 管理)
  REVIEW_LOG.md          ← コードレビュー & 技術的負債 (KNUCKLE 管理)
  SECURITY_FINDINGS.md   ← セキュリティ所見 (FEITAN 管理)
```

## 使い方

1. **配置**: `team-template/` の中身を **新プロジェクトのルート直下** にコピー。
   ```bash
   cp -r team-template/* /path/to/new-project/
   cd /path/to/new-project
   rm -rf team-template
   ```
   `CLAUDE.md` だけはルート直下にあると Claude Code が自動で読みます。

2. **初期化**: `CLAUDE.md` の "プロジェクト共通コンテキスト" セクションを、新しい
   プロジェクトに合わせて 1〜2 行書き換える。

3. **スポーン**: Claude Code に「タスクをチームで進めて」と言えば、CLAUDE.md の
   ルールに沿って HISOKA (Facilitator) がスポーン数を絞って采配します。

## このテンプレートの設計方針

- **Pro プラン前提**: 同時起動は 2〜3 エージェントまで。HISOKA が枠を守る。
- **会話で進捗を見せる**: Claude Code が各エージェントを persona narration で
  コメントしながら動くため、進捗が見える。
- **ドキュメント駆動**: 全てのエージェントは `TASKS.md` / `DECISIONS.md` /
  `BLOCKERS.md` 経由で状態を共有。実装が走り始めたら BISCUIT が随時更新する。
- **セキュリティを後付けしない**: FEITAN は Phase 3 で必ず走る。RLS が 1 つでも
  抜けてたら CRITICAL でデプロイブロック。

## 推奨プロジェクト構成

```
my-project/
  CLAUDE.md             ← エージェント定義
  TASKS.md              ← 進行中タスク
  DECISIONS.md          ← ADR
  BLOCKERS.md           ← ブロッカー
  PROGRESS.md           ← 週次サマリー
  REVIEW_LOG.md         ← レビュー記録
  SECURITY_FINDINGS.md  ← セキュリティ所見
  SECURITY.md           ← (任意) ユーザー向けセキュリティポリシー
  ...                   ← 各プロジェクトの実コード
```

---

> "チームは一人の天才より強い。"
