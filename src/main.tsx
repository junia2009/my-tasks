import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import { installAppHeightFix } from './viewport'
import App from './App.tsx'

// Service Worker を登録。コールバックを渡さない（=skipWaiting しない）ため、
// 新版はインストール後 waiting で待機し、アプリを閉じて開き直すと有効化される。
registerSW({ immediate: true })

// iOS PWA の起動直後のビューポート過小報告を補正（フッターが浮く問題の対策）
installAppHeightFix()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
