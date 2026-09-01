import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { getCurrentSession, login as cognitoLogin, logout as cognitoLogout } from './cognito'

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  loginAsGuest: () => Promise<void>
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

  const logout = useCallback(() => {
    try {
      cognitoLogout()
    } catch {
      // Cognito未設定の環境ではuserPool生成時にthrowするが、ログアウトは何もしなくてよい
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
