import { ContentCard } from './ContentCard'
import { categoryKey, ownerKey } from '../content/openKeys'
import type { ManifestEntry, TreeSection } from '../types/content'

const EMPTY_MESSAGE = 'サンプルフォルダのためナレッジは存在しません'

interface ContentTreeProps {
  section: TreeSection
  entries: ManifestEntry[]
  /** 検索中は、ヒットした記事がある枠だけを表示する（空の枠は出さない） */
  isSearching: boolean
  /** 開いている枠のキー（content/openKeys.ts） */
  openKeys: Set<string>
  onToggle: (key: string) => void
}

/** 一覧を「持ち主 → カテゴリ → 記事」の階層で、見出しクリックで開閉できる形で表示する。 */
export function ContentTree({ section, entries, isSearching, openKeys, onToggle }: ContentTreeProps) {
  return (
    <div className="space-y-4">
      {section.owners.map((owner) => {
        const ownerEntries = entries.filter((e) => e.owner === owner.id)
        const categories = owner.categories
          .map((category) => ({
            category,
            items: ownerEntries.filter((e) => e.category === category.id),
          }))
          .filter(({ items }) => !isSearching || items.length > 0)

        if (isSearching && categories.length === 0) return null

        const isOwnerOpen = openKeys.has(ownerKey(owner.id))

        return (
          <section key={owner.id} className="border-b border-gray-200 pb-4 dark:border-gray-800">
            <h2>
              <ToggleHeading
                label={owner.label}
                count={ownerEntries.length}
                isOpen={isOwnerOpen}
                onClick={() => onToggle(ownerKey(owner.id))}
                className="text-lg font-semibold text-gray-900 dark:text-gray-100"
              />
            </h2>

            {isOwnerOpen &&
              (categories.length === 0 ? (
                <div className="mt-3">
                  <EmptyMessage />
                </div>
              ) : (
                <div className="mt-3 space-y-3 pl-5">
                  {categories.map(({ category, items }) => {
                    const key = categoryKey(owner.id, category.id)
                    const isCategoryOpen = openKeys.has(key)
                    return (
                      <div key={category.id}>
                        <h3>
                          <ToggleHeading
                            label={category.label}
                            count={items.length}
                            isOpen={isCategoryOpen}
                            onClick={() => onToggle(key)}
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                          />
                        </h3>
                        {isCategoryOpen && (
                          <div className="mt-3">
                            {items.length === 0 ? (
                              <EmptyMessage />
                            ) : (
                              <ul className="space-y-3">
                                {items.map((entry) => (
                                  <li key={entry.id}>
                                    <ContentCard entry={entry} />
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
          </section>
        )
      })}
    </div>
  )
}

interface ToggleHeadingProps {
  label: string
  count: number
  isOpen: boolean
  onClick: () => void
  className: string
}

function ToggleHeading({ label, count, isOpen, onClick, className }: ToggleHeadingProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      className={`flex w-full items-center gap-2 text-left hover:opacity-80 ${className}`}
    >
      <span aria-hidden="true" className="w-3 text-xs text-gray-400">
        {isOpen ? '▼' : '▶'}
      </span>
      <span>{label}</span>
      <span className="text-xs font-normal text-gray-500 dark:text-gray-400">（{count}件）</span>
    </button>
  )
}

function EmptyMessage() {
  return (
    <p className="rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
      {EMPTY_MESSAGE}
    </p>
  )
}
