import { useSearchParams } from 'react-router-dom'
import { Header } from '../components/Header'
import { ContentCard } from '../components/ContentCard'
import { SearchBox } from '../components/SearchBox'
import { OfficialPersonalToggle } from '../components/OfficialPersonalToggle'
import { useContent } from '../content/ContentContext'
import { useFilteredEntries } from '../content/useFilteredEntries'
import type { ContentSection } from '../types/content'

function toSection(value: string | null): ContentSection {
  return value === 'personal' ? 'personal' : 'official'
}

export function ListPage() {
  const { entries, isLoading, error } = useContent()
  const [searchParams, setSearchParams] = useSearchParams()

  // タブ・検索の状態はコンポーネントのstateではなくURLに持たせる。
  // 詳細ページ経由で一覧を再マウントしても（一覧に戻るボタン等）状態が消えないようにするため
  const query = searchParams.get('q') ?? ''
  const section = toSection(searchParams.get('section'))

  const filtered = useFilteredEntries(entries, query, section)

  function handleQueryChange(newQuery: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (newQuery) next.set('q', newQuery)
        else next.delete('q')
        return next
      },
      { replace: true },
    )
  }

  function handleSectionChange(newSection: ContentSection) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('section', newSection)
        return next
      },
      { replace: true },
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <OfficialPersonalToggle value={section} onChange={handleSectionChange} />
          <div className="sm:w-64">
            <SearchBox value={query} onChange={handleQueryChange} />
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
