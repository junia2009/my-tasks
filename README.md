# Abyss — Task Management

スマートフォン特化・深海テーマのタスク管理 PWA。  
**データはすべてブラウザの localStorage に保存され、サーバーには一切送信されません。**

## 機能

- **カンバン管理** — 未着手 / 進行中 / 完了 をセグメントタブで切り替え・1 列全幅表示
- **深海デザイン** — トワイライトゾーングラデーション、神光（ゴッドレイ）、立ち上る泡、フロストガラスカード
- **タスク編集** — タイトル・メモ・優先度（高/中/低）・期限日・タグを設定
- **ステータス移動** — カードのクイックボタン、または編集モーダルのセレクターで操作
- **ドラッグ＆ドロップ** — 専用ハンドル（⋮⋮）で列内並べ替え（タップ誤操作なし）
- **フィルター／検索** — キーワード・優先度・タグで絞り込み
- **PWA 対応** — ホーム画面追加でオフライン動作。Service Worker により 2 回起動で自動更新
- **iOS 最適化** — safe-area 対応、フォーカスズーム抑止、viewport 高さ補正

## 技術スタック

| 分類 | 技術 |
| --- | --- |
| フレームワーク | React 19 + TypeScript |
| ビルドツール | Vite 8 |
| スタイリング | Tailwind CSS v3（カスタム abyss / lume パレット） |
| ドラッグ＆ドロップ | @dnd-kit/core + @dnd-kit/sortable |
| PWA | vite-plugin-pwa (Workbox) |
| デプロイ | GitHub Pages (GitHub Actions) |
| データ永続化 | localStorage のみ（バックエンドなし） |

## 開発

```bash
npm install      # 依存インストール
npm run dev      # 開発サーバー起動 (http://localhost:5173)
npm run build    # 本番ビルド (dist/)
npm run preview  # ビルド結果をローカル確認
```

## デプロイ

`main` ブランチへ push すると `.github/workflows/deploy.yml` が自動でビルドし GitHub Pages へ公開します。

初回のみリポジトリの **Settings → Pages → Source** を **「GitHub Actions」** に設定してください。

> `vite.config.ts` の `base: './'` により、リポジトリ名のサブパス配下でもそのまま動作します。

## データについて

すべてのタスクデータはブラウザの localStorage に保存されます。クラウド同期・外部サービスへの送信は行いません。ブラウザのデータを削除するとタスクも消えます。
