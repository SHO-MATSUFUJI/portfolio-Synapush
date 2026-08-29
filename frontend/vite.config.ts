import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const frontendDir = dirname(fileURLToPath(import.meta.url))
// 正本はリポジトリのトップ階層 content/ の1箇所のみ。frontend/public/ には複製しない。
const repoRoot = resolve(frontendDir, '..')
const contentRoot = join(repoRoot, 'content')

const CONTENT_TYPES: Record<string, string> = {
  '.md': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.csv': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
}

function extname(path: string): string {
  const i = path.lastIndexOf('.')
  return i < 0 ? '' : path.slice(i).toLowerCase()
}

// content/ 配下から記事本文（固定ファイル名 index.md）だけを再帰収集する。
// 各記事フォルダの attachments/ は本文ではないので走査対象から除外する。
function collectArticles(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'attachments') continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) collectArticles(full, acc)
    else if (name === 'index.md') acc.push(full)
  }
  return acc
}

function parseFrontmatter(raw: string): Record<string, string | string[]> {
  const block = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!block) return {}
  const meta: Record<string, string | string[]> = {}
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

function bodyKeywords(raw: string): string {
  return raw
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
    .replace(/[#>*`|_[\]()-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300)
}

// 開発サーバー限定の対処（configureServer のみ。vite build / 本番配信には影響しない）。
//   GET /content/manifest.json  … content/ を走査してその場で生成する（正本を複製しないため）
//   GET /content/<path>         … リポジトリのトップ階層 content/<path> をそのまま配信する
// 本番（GitHub Actions → S3 sync → CloudFront）では、manifest 生成と charset 付与を
// GitHub Actions 側のアップロード処理で行う。
//
// NOTE: ここでの section/path/searchText の導出ルールは暫定。CI 側の manifest 生成を
//       実装する際に仕様をすり合わせ、可能なら共通モジュールに切り出すこと。
function serveRepoContent(): Plugin {
  return {
    name: 'serve-repo-content',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/content/')) return next()

        let rel: string
        try {
          rel = decodeURIComponent(req.url.split('?')[0].slice('/content/'.length))
        } catch {
          res.statusCode = 400
          return res.end('Bad Request')
        }

        if (rel === 'manifest.json') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          if (!existsSync(contentRoot)) return res.end('[]')
          const entries = collectArticles(contentRoot).map((file) => {
            const raw = readFileSync(file, 'utf-8')
            const meta = parseFrontmatter(raw)
            const path = file.slice(contentRoot.length + 1).split(sep).join('/')
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
          return res.end(JSON.stringify(entries))
        }

        const filePath = join(contentRoot, rel)
        if (!filePath.startsWith(contentRoot + sep)) {
          res.statusCode = 403
          return res.end('Forbidden')
        }
        if (!existsSync(filePath) || !statSync(filePath).isFile()) return next()
        res.setHeader('Content-Type', CONTENT_TYPES[extname(filePath)] ?? 'application/octet-stream')
        createReadStream(filePath).pipe(res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), serveRepoContent()],
  server: {
    fs: {
      // 開発サーバーが frontend/ の外（リポジトリのトップ階層 content/ など）を読めるように許可する
      allow: [frontendDir, repoRoot],
    },
  },
  // amazon-cognito-identity-jsが内部で参照するNode.jsのglobalをブラウザ用に読み替える
  define: {
    global: 'globalThis',
  },
})
