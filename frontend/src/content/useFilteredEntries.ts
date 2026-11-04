import { useMemo } from 'react'
import type { ContentSection, ManifestEntry } from '../types/content'

/** 記事が検索語にヒットするか（タイトル・タグ・本文の一部で判定）。検索語が空なら常に true。 */
export function matchesQuery(entry: ManifestEntry, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true
  const haystack = [entry.title, ...entry.tags, entry.searchText].join(' ').toLowerCase()
  return haystack.includes(normalizedQuery)
}

export function useFilteredEntries(
  entries: ManifestEntry[],
  query: string,
  section: ContentSection,
): ManifestEntry[] {
  return useMemo(
    () => entries.filter((entry) => entry.section === section && matchesQuery(entry, query)),
    [entries, query, section],
  )
}
