import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { ManifestEntry } from '../types/content'
import { useAuth } from '../auth/AuthContext'

interface ContentContextValue {
  entries: ManifestEntry[]
  isLoading: boolean
  error: string | null
}

const ContentContext = createContext<ContentContextValue>({
  entries: [],
  isLoading: true,
  error: null,
})

export function ContentProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [entries, setEntries] = useState<ManifestEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false
    setIsLoading(true)

    fetch('/content/manifest.json')
      .then((res) => {
        if (!res.ok) throw new Error(`manifest.jsonの取得に失敗しました (${res.status})`)
        return res.json() as Promise<ManifestEntry[]>
      })
      .then((data) => {
        if (!cancelled) setEntries(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  return (
    <ContentContext.Provider value={{ entries, isLoading, error }}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent(): ContentContextValue {
  return useContext(ContentContext)
}
