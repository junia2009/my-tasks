import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export type Theme = 'light' | 'dark'

function initialTheme(): Theme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

/** Theme synced to <html class="dark"> and persisted in localStorage. */
export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>('kanban.theme', initialTheme())

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return { theme, toggle }
}
