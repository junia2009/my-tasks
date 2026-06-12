import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// Service Worker を登録。コールバックを渡さない（=skipWaiting しない）ため、
// 新版はインストール後 waiting で待機し、アプリを閉じて開き直すと有効化される。
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
