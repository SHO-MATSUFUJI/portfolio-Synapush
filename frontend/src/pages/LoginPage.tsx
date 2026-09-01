import { useState, type SubmitEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function LoginPage() {
  const { isAuthenticated, login, loginAsGuest, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await login(email, password)
    } catch {
      // エラーメッセージはuseAuthのerrorで表示するため、ここでは何もしない
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGuestLogin() {
    setIsSubmitting(true)
    try {
      await loginAsGuest()
    } catch {
      // 同上
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
        <h1 className="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Synapush
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
              メールアドレス
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
              パスワード
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-gray-900 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
          >
            ログイン
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
          または
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
        </div>

        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={isSubmitting}
          className="w-full rounded-md border border-gray-300 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
        >
          ゲストとしてログイン
        </button>
      </div>
    </div>
  )
}
