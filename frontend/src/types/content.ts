export type ContentSection = 'official' | 'personal'

export interface ManifestEntry {
  id: string
  title: string
  /** カテゴリのID（フォルダ名） */
  category: string
  /** カテゴリの表示名（content/structure.json で定義） */
  categoryLabel: string
  section: ContentSection
  /** 持ち主のID（フォルダ名） */
  owner: string
  /** 持ち主の表示名（content/structure.json で定義） */
  ownerLabel: string
  tags: string[]
  updated: string
  path: string
  searchText: string
}

// 一覧の階層（タブ → 持ち主 → カテゴリ）。content/structure.json の内容がそのまま入る
export interface TreeCategory {
  id: string
  label: string
}

export interface TreeOwner {
  id: string
  label: string
  categories: TreeCategory[]
}

export interface TreeSection {
  id: ContentSection
  label: string
  owners: TreeOwner[]
}

export interface Manifest {
  tree: TreeSection[]
  entries: ManifestEntry[]
}
