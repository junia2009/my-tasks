import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
  plugins: [react()],
})
