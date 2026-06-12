/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// vite.config.ts の define で埋め込まれるビルド情報
declare const __APP_VERSION__: string
declare const __BUILD_DATE__: string
declare const __COMMIT__: string
