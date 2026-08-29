export type ContentSection = 'official' | 'personal'

export interface ManifestEntry {
  id: string
  title: string
  category: string
  section: ContentSection
  tags: string[]
  updated: string
  path: string
  searchText: string
}
