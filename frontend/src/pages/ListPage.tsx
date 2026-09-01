import { useState } from 'react'
import { Header } from '../components/Header'
import { ContentCard } from '../components/ContentCard'
import { SearchBox } from '../components/SearchBox'
import { OfficialPersonalToggle } from '../components/OfficialPersonalToggle'
import { useContent } from '../content/ContentContext'
import { useFilteredEntries } from '../content/useFilteredEntries'
import type { ContentSection } from '../types/content'

export function ListPage() {
  const { entries, isLoading, error } = useContent()
  const [query, setQuery] = useState('')
  const [section, setSection] = useState<ContentSection>('official')

  const filtered = useFilteredEntries(entries, query, section)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <OfficialPersonalToggle value={section} onChange={setSection} />
          <div className="sm:w-64">
            <SearchBox value={query} onChange={setQuery} />
          </div>
        </div>

        {isLoading && <p className="text-sm text-gray-500">読み込み中...</p>}
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {!isLoading && !error && filtered.length === 0 && (
          <p className="text-sm text-gray-500">該当するナレッジがありません</p>
        )}

        <ul className="space-y-3">
          {filtered.map((entry) => (
            <li key={entry.id}>
              <ContentCard entry={entry} />
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
