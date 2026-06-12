import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base: './' で相対パス出力にし、GitHub Pages のリポジトリ名サブパス配下でも
// 動作するようにしている（リポジトリ名に依存しない）。
export default defineConfig({
  base: './',
  plugins: [react()],
})
