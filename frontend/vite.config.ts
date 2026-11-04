import { createReadStream, existsSync, statSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
// manifest 生成ルールの正本（CI と共通）。開発サーバーでも同じ関数で生成する
import { generateManifest } from '../scripts/generate-manifest.mjs'

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

// 開発サーバー限定の対処（configureServer のみ。vite build / 本番配信には影響しない）。
//   GET /content/manifest.json  … content/ を走査してその場で生成する（正本を複製しないため。
//                                  生成は scripts/generate-manifest.mjs を CI と共用する）
//   GET /content/<path>         … リポジトリのトップ階層 content/<path> をそのまま配信する
// 本番（GitHub Actions → S3 sync → CloudFront）では、manifest 生成と charset 付与を
// GitHub Actions 側のアップロード処理で行う。
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
          try {
            return res.end(JSON.stringify(generateManifest(contentRoot)))
          } catch (err) {
            // 対応表（content/structure.json）が無い・壊れている場合など
            res.statusCode = 500
            return res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }))
          }
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
