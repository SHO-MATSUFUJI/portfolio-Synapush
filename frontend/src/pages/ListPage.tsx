import { useSearchParams } from 'react-router-dom'
import { Header } from '../components/Header'
import { ContentTree } from '../components/ContentTree'
import { SearchBox } from '../components/SearchBox'
import { OfficialPersonalToggle } from '../components/OfficialPersonalToggle'
import { useContent } from '../content/ContentContext'
import { hitKeys, parseOpenKeys } from '../content/openKeys'
import { useFilteredEntries } from '../content/useFilteredEntries'
import type { ContentSection } from '../types/content'

function toSection(value: string | null): ContentSection {
  return value === 'personal' ? 'personal' : 'official'
}

export function ListPage() {
  const { tree, entries, isLoading, error } = useContent()
  const [searchParams, setSearchParams] = useSearchParams()

  // タブ・検索・開閉の状態はコンポーネントのstateではなくURLに持たせる。
  // 詳細ページ経由で一覧を再マウントしても（一覧に戻るボタン等）状態が消えないようにするため
  const query = searchParams.get('q') ?? ''
  const section = toSection(searchParams.get('section'))
  const openKeys = parseOpenKeys(searchParams.get('open'))

  const filtered = useFilteredEntries(entries, query, section)
  const sectionTree = tree.find((s) => s.id === section)
  const isSearching = query.trim() !== ''

  function handleQueryChange(newQuery: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (newQuery) next.set('q', newQuery)
        else next.delete('q')
        // 検索中はヒットした記事を含む枠を開く（検索語が変わるたびに置き換える）。
        // 検索語を消したら、すべて閉じた初期状態に戻す
        const keys = newQuery.trim() ? hitKeys(entries, newQuery) : []
        if (keys.length > 0) next.set('open', keys.join(','))
        else next.delete('open')
        return next
      },
      { replace: true },
    )
  }

  function handleToggle(key: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        const keys = parseOpenKeys(prev.get('open'))
        if (keys.has(key)) keys.delete(key)
        else keys.add(key)
        if (keys.size > 0) next.set('open', [...keys].join(','))
        else next.delete('open')
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
        {!isLoading && !error && isSearching && filtered.length === 0 && (
          <p className="text-sm text-gray-500">該当するナレッジがありません</p>
        )}

        {!isLoading && !error && sectionTree && (
          <ContentTree
            section={sectionTree}
            entries={filtered}
            isSearching={isSearching}
            openKeys={openKeys}
            onToggle={handleToggle}
          />
        )}
      </main>
    </div>
  )
}
