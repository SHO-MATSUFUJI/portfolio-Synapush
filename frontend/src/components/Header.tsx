import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function Header() {
  const { logout } = useAuth()

  return (
    <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
      <Link to="/" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Synapush
      </Link>
      <div className="flex items-center gap-4">
        {/*
          ゲストアカウントでもこのリンクは隠さない。本番運用なら使えない機能は見せない方が
          UXとして適切だが、ここはポートフォリオのため、提案フォームの存在自体を見てもらう
          （押すとLambda側の403で拒否され、権限による多層防御が動いているデモになる）ことを優先している
        */}
        <Link
          to="/propose"
          className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          ナレッジ提案
        </Link>
        <button
          type="button"
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          ログアウト
        </button>
      </div>
    </header>
  )
}
