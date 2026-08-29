import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// public/content配下のテキスト系ファイルにcharset=utf-8を付ける（devサーバー限定の対処。
// 本番のS3配信では別途 GitHub Actions 側のアップロード処理でcharsetを付ける必要がある）
function contentUtf8Charset(): Plugin {
  return {
    name: 'content-utf8-charset',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/content/') && /\.(md|txt|csv)($|\?)/.test(req.url)) {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), contentUtf8Charset()],
  // amazon-cognito-identity-jsが内部で参照するNode.jsのglobalをブラウザ用に読み替える
  define: {
    global: 'globalThis',
  },
})
