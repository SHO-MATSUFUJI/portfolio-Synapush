// content/ 配下の記事のfrontmatterが docs/frontmatter-spec.md のルールに沿っているか検証する。
//
// ファイル収集・frontmatterパースは generate-manifest.mjs のロジックを共有する（正本を一本化するため）。
// 本スクリプトは id / title / category / tags / updated の存在・形式・idの重複のみを検証し、
// 生成物（manifest.json）は作らない。
//
// CLI: node scripts/validate-frontmatter.mjs [contentDir=content]
//   検証に失敗した記事があれば ::error:: 形式（GitHub Actionsの注釈）で出力し、exit code 1 で終了する。

import { readFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { collectArticles, parseFrontmatter } from './generate-manifest.mjs'

const ID_PATTERN = /^[a-z0-9-]+$/
const CATEGORY_PATTERN = /^[a-z0-9-]+$/
const UPDATED_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/** 1記事分のfrontmatterを検証し、エラーメッセージの配列を返す（問題なければ空配列）。 */
function validateArticle(meta) {
  const errors = []

  for (const key of ['id', 'title', 'category', 'tags', 'updated']) {
    const missing = key === 'tags' ? !Array.isArray(meta.tags) : typeof meta[key] !== 'string' || meta[key] === ''
    if (missing) errors.push(`必須項目 "${key}" が存在しません`)
  }

  if (typeof meta.id === 'string' && meta.id !== '' && !ID_PATTERN.test(meta.id)) {
    errors.push(`id "${meta.id}" は英数字小文字とハイフンのみで指定してください`)
  }
  if (typeof meta.category === 'string' && meta.category !== '' && !CATEGORY_PATTERN.test(meta.category)) {
    errors.push(`category "${meta.category}" は英数字小文字とハイフンのみで指定してください`)
  }
  if (typeof meta.updated === 'string' && meta.updated !== '' && !UPDATED_PATTERN.test(meta.updated)) {
    errors.push(`updated "${meta.updated}" はYYYY-MM-DD形式で指定してください`)
  }

  return errors
}

const contentDir = resolve(process.argv[2] ?? 'content')
const files = collectArticles(contentDir)

let hasError = false
const idOwners = new Map()

for (const file of files) {
  const relPath = relative(process.cwd(), file)
  const meta = parseFrontmatter(readFileSync(file, 'utf-8'))

  for (const message of validateArticle(meta)) {
    hasError = true
    console.log(`::error file=${relPath}::${message}`)
  }

  if (typeof meta.id === 'string' && meta.id !== '') {
    const owners = idOwners.get(meta.id) ?? []
    owners.push(relPath)
    idOwners.set(meta.id, owners)
  }
}

for (const [id, owners] of idOwners) {
  if (owners.length <= 1) continue
  hasError = true
  for (const relPath of owners) {
    console.log(`::error file=${relPath}::id "${id}" が重複しています（${owners.join(', ')}）`)
  }
}

if (hasError) {
  console.error('frontmatterの検証に失敗しました')
  process.exit(1)
}
console.log(`frontmatterの検証OK（${files.length}件）`)
