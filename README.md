# 📋 タスクボード（カンバン式タスク管理）

ブラウザだけで動く、エンジニア向けのカンバン式タスク管理ツールです。
**データはすべてブラウザの localStorage に保存され、サーバーには一切送信されません。**

## 機能

- **カンバン形式**: To Do / In Progress / Done の3列
- **ドラッグ&ドロップ**: カードを列の間・列内で並べ替え
- **優先度**: 高 / 中 / 低（カード左端の色バーで表示）
- **期限日**: 期限切れ・当日・間近を色分け警告、ヘッダーに期限切れ件数を表示
- **タグ**: カンマ区切りで複数タグを付与
- **検索 / 絞り込み**: キーワード検索、優先度・タグでのフィルタ

## 技術スタック

- React + TypeScript + Vite
- Tailwind CSS
- @dnd-kit（ドラッグ&ドロップ）
- 永続化は localStorage のみ（バックエンドなし）

## 開発

```bash
npm install      # 依存インストール
npm run dev      # 開発サーバー起動 (http://localhost:5173)
npm run build    # 本番ビルド (dist/)
npm run preview  # ビルド結果をローカル確認
```

## デプロイ

### 方法A: GitHub Pages（推奨・設定済み）

1. GitHub に新規リポジトリを作成し、このコードを push する。
2. リポジトリの **Settings → Pages → Build and deployment → Source** を
   **「GitHub Actions」** に設定する。
3. `main` ブランチへ push すると `.github/workflows/deploy.yml` が自動でビルド・公開する。

> `vite.config.ts` の `base: './'` により、リポジトリ名のサブパス配下でも
> そのまま動作します（設定変更不要）。

### 方法B: Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # public ディレクトリは「dist」、SPA は Yes
npm run build
firebase deploy
```
