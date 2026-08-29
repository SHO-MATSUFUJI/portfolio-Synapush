import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Markdown本文中のリンクは、contentルート起点の絶対パス（例: /official/.../attachments/foo.xlsx）
// で書く運用のため、実際のfetch/ダウンロード先である /content 配下に解決する
function resolveHref(href: string): string {
  if (href.startsWith('/')) return `/content${href}`
  return href
}

export function MarkdownRenderer({ markdown }: { markdown: string }) {
  return (
    <div className="prose prose-gray max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => (
            <a href={href ? resolveHref(href) : undefined} {...props}>
              {children}
            </a>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
