/**
 * iOS の PWA（ホーム追加版）は起動直後に古い（短い）ビューポート高を報告し、
 * スクロール等の操作をきっかけに正しい値へ再計算する。CSS の 100dvh も
 * その再計算までは短いままになるため、JS で実測して --app-height に反映する。
 *
 * - visualViewport.height は起動直後でも正確なことが多い
 * - innerHeight はキーボード表示で縮まない
 * → 両者の大きい方を採用すると、起動時の過小報告にもキーボードにも強い。
 */
export function installAppHeightFix() {
  const update = () => {
    const h = Math.max(window.innerHeight, window.visualViewport?.height ?? 0)
    document.documentElement.style.setProperty('--app-height', `${h}px`)
  }

  update()
  // iOS が起動後しばらくしてから正しい値に直すケースを拾う再計測
  requestAnimationFrame(update)
  setTimeout(update, 150)
  setTimeout(update, 500)
  setTimeout(update, 1500)

  window.addEventListener('resize', update)
  window.addEventListener('orientationchange', update)
  window.addEventListener('pageshow', update)
  window.visualViewport?.addEventListener('resize', update)
}
