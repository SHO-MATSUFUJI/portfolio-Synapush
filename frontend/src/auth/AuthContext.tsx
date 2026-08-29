import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { getCurrentSession, login as cognitoLogin, logout as cognitoLogout } from './cognito'

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  loginAsGuest: () => Promise<void>
  loginAsDevPreview?: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCurrentSession()
      .then((session) => setIsAuthenticated(!!session?.isValid()))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      await cognitoLogin(email, password)
      setIsAuthenticated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました')
      throw err
    }
  }, [])

  const loginAsGuest = useCallback(async () => {
    const guestEmail = import.meta.env.VITE_GUEST_EMAIL
    const guestPassword = import.meta.env.VITE_GUEST_PASSWORD
    if (!guestEmail || !guestPassword) {
      setError('ゲストアカウントが設定されていません')
      return
    }
    await login(guestEmail, guestPassword)
  }, [login])

  // Cognito未接続でも画面確認できるよう、開発ビルド限定でログインを素通りさせる。
  // CloudFront側では未認証アクセスをまだ防いでいないため、isAuthenticatedを外部から
  // 書き換えられるこの関数は、呼び出し口（ボタン）だけでなく定義自体を本番ビルドから除去する
  const loginAsDevPreview = import.meta.env.DEV
    ? () => {
        setError(null)
        setIsAuthenticated(true)
      }
    : undefined

  const logout = useCallback(() => {
    try {
      cognitoLogout()
    } catch {
      // Cognito未接続（devプレビュー）でのログアウトは何もしなくてよい
    }
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        error,
        login,
        loginAsGuest,
        loginAsDevPreview,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
