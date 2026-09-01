import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Header } from '../components/Header'
import { MarkdownRenderer } from '../components/MarkdownRenderer'
import { useContent } from '../content/ContentContext'
import { stripFrontmatter } from '../content/stripFrontmatter'

export function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const { entries, isLoading: isManifestLoading } = useContent()
  const [markdown, setMarkdown] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const entry = entries.find((e) => e.id === id)

  useEffect(() => {
    if (!entry) return

    let cancelled = false
    fetch(`/content/${entry.path}`)
      .then((res) => {
        if (!res.ok) throw new Error(`本文の取得に失敗しました (${res.status})`)
        return res.text()
      })
      .then((raw) => {
        if (!cancelled) setMarkdown(stripFrontmatter(raw))
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      })

    return () => {
      cancelled = true
    }
  }, [entry])

  if (!isManifestLoading && !entry) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
          ← 一覧に戻る
        </Link>

        {entry && (
          <div className="mt-4 mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {entry.title}
            </h1>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {entry.category} ・ 更新日 {entry.updated}
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {markdown && <MarkdownRenderer markdown={markdown} />}
      </main>
    </div>
  )
}
