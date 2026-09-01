import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function Header() {
  const { logout } = useAuth()

  return (
    <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
      <Link to="/" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Synapush
      </Link>
      <button
        type="button"
        onClick={logout}
        className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        ログアウト
      </button>
    </header>
  )
}
