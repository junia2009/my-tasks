import { useEffect, useState } from 'react'

/**
 * State synced to localStorage. Data lives only in the browser — nothing leaves
 * the client.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
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
