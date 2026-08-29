import { Link } from 'react-router-dom'
import type { ManifestEntry } from '../types/content'

export function ContentCard({ entry }: { entry: ManifestEntry }) {
  return (
    <Link
      to={`/n/${entry.id}`}
      className="block rounded-lg border border-gray-200 p-4 transition hover:border-gray-400 hover:shadow-sm dark:border-gray-800 dark:hover:border-gray-600"
    >
      <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">
        {entry.title}
      </h2>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {entry.category} ・ 更新日 {entry.updated}
      </p>
      {entry.tags.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </Link>
  )
}
