import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

// ビルド時のコミットハッシュ（取得できない環境では 'local' にフォールバック）
let commit = 'local'
try {
  commit = execSync('git rev-parse --short HEAD').toString().trim()
} catch {
  // git 未使用のビルド環境などでは無視
}

const buildDate = new Date().toISOString().slice(0, 10)

// https://vite.dev/config/
// base: './' で相対パス出力にし、GitHub Pages のリポジトリ名サブパス配下でも
// 動作するようにしている（リポジトリ名に依存しない）。
export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify(buildDate),
    __COMMIT__: JSON.stringify(commit),
  },
  plugins: [
    react(),
    VitePWA({
      // registerType: 'prompt' は skipWaiting を呼ばない標準ライフサイクル。
      // 新版はインストール後 waiting になり、アプリを閉じて開き直すと有効化される
      // （＝1回目の起動で裏に取り込み、2回目の起動で更新が反映される）。
      registerType: 'prompt',
      injectRegister: false, // 登録は main.tsx で明示的に行う
      includeAssets: ['favicon.svg', 'pwa-icon.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // index.html はキャッシュしつつ、起動毎に更新確認できるよう
        // ナビゲーションは NetworkFirst 相当の更新フローに任せる。
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'Abyss — Task Management',
        short_name: 'Abyss',
        description: 'スマホ特化・深海テーマのタスク管理',
        lang: 'ja',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#020912',
        theme_color: '#020912',
        icons: [
          {
            src: 'pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
