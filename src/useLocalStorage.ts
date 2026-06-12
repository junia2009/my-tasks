import { useEffect, useState } from 'react'

interface Options<T> {
  /** Coerce/validate the parsed value before use (guards against corrupt data). */
  sanitize?: (raw: unknown) => T
}

/**
 * State synced to localStorage. Data lives only in the browser — nothing leaves
 * the client.
 *
 * `initialValue` may be a factory function so expensive defaults are only
 * computed when there is nothing stored.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: Options<T> = {},
) {
  const { sanitize } = options

  const [value, setValue] = useState<T>(() => {
    const fallback = () => (typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue)
    try {
      const stored = window.localStorage.getItem(key)
      if (stored === null) return fallback()
      const parsed: unknown = JSON.parse(stored)
      return sanitize ? sanitize(parsed) : (parsed as T)
    } catch {
      return fallback()
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage full or unavailable — ignore, app still works in-memory
    }
  }, [key, value])

  return [value, setValue] as const
}
