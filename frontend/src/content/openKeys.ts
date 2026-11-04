import type { ManifestEntry } from '../types/content'
import { matchesQuery } from './useFilteredEntries'

// 一覧の開閉状態は、開いている枠のキーをURLの open パラメータにカンマ区切りで持たせる。
// キーは 持ち主: <ownerId> / カテゴリ: <ownerId>/<categoryId>（IDは英数字小文字とハイフンのみ）

export function ownerKey(ownerId: string): string {
  return ownerId
}

export function categoryKey(ownerId: string, categoryId: string): string {
  return `${ownerId}/${categoryId}`
}

export function parseOpenKeys(value: string | null): Set<string> {
  return new Set((value ?? '').split(',').filter(Boolean))
}

/** 検索語にヒットした記事を含む枠（持ち主・カテゴリ）のキー。全タブ分を返す。 */
export function hitKeys(entries: ManifestEntry[], query: string): string[] {
  const keys = new Set<string>()
  for (const entry of entries) {
    if (!matchesQuery(entry, query)) continue
    keys.add(ownerKey(entry.owner))
    keys.add(categoryKey(entry.owner, entry.category))
  }
  return [...keys]
}
