import { useMemo } from 'react'
import type { ContentSection, ManifestEntry } from '../types/content'

export function useFilteredEntries(
  entries: ManifestEntry[],
  query: string,
  section: ContentSection,
): ManifestEntry[] {
  return useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return entries
      .filter((entry) => entry.section === section)
      .filter((entry) => {
        if (!normalizedQuery) return true
        const haystack = [entry.title, ...entry.tags, entry.searchText]
          .join(' ')
          .toLowerCase()
        return haystack.includes(normalizedQuery)
      })
  }, [entries, query, section])
}
