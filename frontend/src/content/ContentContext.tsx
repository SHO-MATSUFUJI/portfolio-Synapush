import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Manifest, ManifestEntry, TreeSection } from '../types/content'
import { useAuth } from '../auth/AuthContext'

interface ContentContextValue {
  tree: TreeSection[]
  entries: ManifestEntry[]
  isLoading: boolean
  error: string | null
}

const ContentContext = createContext<ContentContextValue>({
  tree: [],
  entries: [],
  isLoading: true,
  error: null,
})

export function ContentProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [tree, setTree] = useState<TreeSection[]>([])
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
        return res.json() as Promise<Manifest>
      })
      .then((data) => {
        if (cancelled) return
        setTree(data.tree)
        setEntries(data.entries)
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
    <ContentContext.Provider value={{ tree, entries, isLoading, error }}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent(): ContentContextValue {
  return useContext(ContentContext)
}
