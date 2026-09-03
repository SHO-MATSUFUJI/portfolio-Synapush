// content/ 配下の記事から manifest.json を生成する。
//
// この関数が manifest 生成ルールの正本。CI（.github/workflows/deploy-content.yml）から呼ばれる。
// 開発サーバー（frontend/vite.config.ts）側にも同じ導出ロジックがインラインで入っている。
// 両ブランチが main にマージされたら vite.config.ts を本モジュール import に寄せて重複を解消する。
// それまでは section / path / searchText の導出ルールを変えたら両方直すこと。
//
// 走査ルール:
//   - 記事本文は固定ファイル名 index.md のみ（再帰探索）
//   - 各記事フォルダの attachments/ ディレクトリは走査対象外
//   - frontmatter は id / title / category / tags / updated の5項目
//   - section / path / searchText は本関数がフォルダ位置と本文から導出する
//
// CLI: node scripts/generate-manifest.mjs [contentDir=content] [outFile]
//   outFile を省略すると標準出力へ書き出す。

import { existsSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const BODY_KEYWORDS_LIMIT = 300

/** content/ 配下から記事本文（index.md）を再帰収集する。attachments/ は除外。 */
function collectArticles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'attachments') continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) collectArticles(full, acc)
    else if (name === 'index.md') acc.push(full)
  }
  return acc
}

/** --- で囲まれた frontmatter を素朴にパースする（id/title/category/tags/updated 想定）。 */
function parseFrontmatter(raw) {
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
 * @returns {Array<{id,title,category,section,tags,updated,path,searchText}>}
 */
export function generateManifest(contentRoot) {
  if (!existsSync(contentRoot)) return []

  const entries = collectArticles(contentRoot).map((file) => {
    const raw = readFileSync(file, 'utf-8')
    const meta = parseFrontmatter(raw)
    const path = relative(contentRoot, file).split(sep).join('/')
    const title = typeof meta.title === 'string' ? meta.title : ''
    const tags = Array.isArray(meta.tags) ? meta.tags : []
    return {
      id: typeof meta.id === 'string' ? meta.id : '',
      title,
      category: typeof meta.category === 'string' ? meta.category : '',
      section: path.startsWith('personal/') ? 'personal' : 'official',
      tags,
      updated: typeof meta.updated === 'string' ? meta.updated : '',
      path,
      searchText: [title, tags.join(' '), bodyKeywords(raw)].join(' ').replace(/\s+/g, ' ').trim(),
    }
  })

  entries.sort((a, b) => (a.updated === b.updated ? a.id.localeCompare(b.id) : a.updated < b.updated ? 1 : -1))
  return entries
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
