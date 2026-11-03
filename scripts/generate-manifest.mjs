// content/ 配下の記事と対応表（content/structure.json）から manifest.json を生成する。
//
// この関数が manifest 生成ルールの正本。CI（.github/workflows/deploy-content.yml）と
// 開発サーバー（frontend/vite.config.ts）の両方から呼ばれる。
//
// collectArticles / parseFrontmatter / loadStructure / findLocation は frontmatter検証
// （scripts/validate-frontmatter.mjs）からも import される。
//
// フォルダ構成: content/<section>/<owner>/<category>/<記事フォルダ>/index.md
//   各階層のフォルダ名がID、表示名は対応表で定義する。
//
// 走査ルール:
//   - 記事本文は固定ファイル名 index.md のみ（再帰探索）
//   - 各記事フォルダの attachments/ ディレクトリと、content/_template/ は走査対象外
//   - frontmatter は id / title / category / tags / updated の5項目
//   - section / owner / 表示名 / path / searchText は本関数がフォルダ位置・対応表・本文から導出する
//
// 出力: { tree: 対応表の階層（記事が無い枠も含む）, entries: 記事一覧 }
//
// CLI: node scripts/generate-manifest.mjs [contentDir=content] [outFile]
//   outFile を省略すると標準出力へ書き出す。

import { existsSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const BODY_KEYWORDS_LIMIT = 300
export const STRUCTURE_FILE = 'structure.json'

/** 対応表（content/structure.json）を読み込む。 */
export function loadStructure(contentRoot) {
  return JSON.parse(readFileSync(join(contentRoot, STRUCTURE_FILE), 'utf-8'))
}

/**
 * content/ からの相対パス（例: personal/matsufuji-shoichi/risk-assessment/ra-ch1/index.md）を
 * 対応表に照らし、該当する section / owner / category を返す。見つからない階層は undefined。
 */
export function findLocation(structure, path) {
  const [sectionId, ownerId, categoryId] = path.split('/')
  const section = structure.sections.find((s) => s.id === sectionId)
  const owner = section?.owners.find((o) => o.id === ownerId)
  const category = owner?.categories.find((c) => c.id === categoryId)
  return { sectionId, ownerId, categoryId, section, owner, category }
}

/** content/ 配下から記事本文（index.md）を再帰収集する。attachments/・_template/ は除外。 */
export function collectArticles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'attachments' || name === '_template') continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) collectArticles(full, acc)
    else if (name === 'index.md') acc.push(full)
  }
  return acc
}

/** --- で囲まれた frontmatter を素朴にパースする（id/title/category/tags/updated 想定）。 */
export function parseFrontmatter(raw) {
  const block = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!block) return {}
  const meta = {}
  for (const line of block[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!kv) continue
    const value = kv[2].trim()
    meta[kv[1]] =
      value.startsWith('[') && value.endsWith(']')
        ? value
            .slice(1, -1)
            .split(',')
            .map((s) => s.trim().replace(/^["']|["']$/g, ''))
            .filter(Boolean)
        : value.replace(/^["']|["']$/g, '')
  }
  return meta
}

/** frontmatter を除いた本文から、検索用にキーワードを抽出する（記号を落として先頭を切り出す）。 */
function bodyKeywords(raw) {
  return raw
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
    .replace(/[#>*`|_[\]()-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, BODY_KEYWORDS_LIMIT)
}

/**
 * @param {string} contentRoot content/ ディレクトリの絶対 or 相対パス
 * @returns {{ tree: Array<{id,label,owners}>, entries: Array<{id,title,category,categoryLabel,section,owner,ownerLabel,tags,updated,path,searchText}> }}
 */
export function generateManifest(contentRoot) {
  if (!existsSync(contentRoot)) return { tree: [], entries: [] }

  const structure = loadStructure(contentRoot)

  const entries = collectArticles(contentRoot).map((file) => {
    const raw = readFileSync(file, 'utf-8')
    const meta = parseFrontmatter(raw)
    const path = relative(contentRoot, file).split(sep).join('/')
    const title = typeof meta.title === 'string' ? meta.title : ''
    const tags = Array.isArray(meta.tags) ? meta.tags : []
    const location = findLocation(structure, path)
    return {
      id: typeof meta.id === 'string' ? meta.id : '',
      title,
      // category はフォルダ名と一致することを validate-frontmatter で保証している
      category: location.categoryId,
      // 対応表に無い場合はIDをそのまま表示名にする（validate-frontmatter でエラーになる想定）
      categoryLabel: location.category?.label ?? location.categoryId,
      section: location.sectionId,
      owner: location.ownerId,
      ownerLabel: location.owner?.label ?? location.ownerId,
      tags,
      updated: typeof meta.updated === 'string' ? meta.updated : '',
      path,
      searchText: [title, tags.join(' '), bodyKeywords(raw)].join(' ').replace(/\s+/g, ' ').trim(),
    }
  })

  entries.sort((a, b) => (a.updated === b.updated ? a.id.localeCompare(b.id) : a.updated < b.updated ? 1 : -1))
  return { tree: structure.sections, entries }
}

// CLI として直接実行されたときだけ動く（他ファイルから import されたときは動かない）
const invokedDirectly =
  process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))

if (invokedDirectly) {
  const contentDir = resolve(process.argv[2] ?? 'content')
  const outFile = process.argv[3]
  const json = JSON.stringify(generateManifest(contentDir), null, 2)
  if (outFile) {
    writeFileSync(outFile, json + '\n')
    console.error(`wrote ${outFile}`)
  } else {
    process.stdout.write(json + '\n')
  }
}
