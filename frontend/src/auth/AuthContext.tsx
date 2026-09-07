import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { CognitoUser } from 'amazon-cognito-identity-js'
import {
  getCurrentSession,
  login as cognitoLogin,
  logout as cognitoLogout,
  completeNewPassword as cognitoCompleteNewPassword,
} from './cognito'

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  isNewPasswordRequired: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  loginAsGuest: () => Promise<void>
  completeNewPassword: (newPassword: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isNewPasswordRequired, setIsNewPasswordRequired] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // 新パスワード入力を待っている間だけ使う一時状態のためrefで保持（レンダリング契機にはしない）
  const pendingChallengeRef = useRef<{
    cognitoUser: CognitoUser
    userAttributes: Record<string, unknown>
  } | null>(null)

  useEffect(() => {
    getCurrentSession()
      .then((session) => setIsAuthenticated(!!session?.isValid()))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      const result = await cognitoLogin(email, password)
      if (result.status === 'newPasswordRequired') {
        pendingChallengeRef.current = {
          cognitoUser: result.cognitoUser,
          userAttributes: result.userAttributes,
        }
        setIsNewPasswordRequired(true)
        return
      }
      setIsAuthenticated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました')
      throw err
    }
  }, [])

  const completeNewPassword = useCallback(async (newPassword: string) => {
    setError(null)
    const pending = pendingChallengeRef.current
    if (!pending) {
      setError('パスワード変更のセッションが失われました。もう一度ログインしてください。')
      return
    }
    try {
      await cognitoCompleteNewPassword(pending.cognitoUser, newPassword, pending.userAttributes)
      pendingChallengeRef.current = null
      setIsNewPasswordRequired(false)
      setIsAuthenticated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'パスワードの変更に失敗しました')
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
    pendingChallengeRef.current = null
    setIsNewPasswordRequired(false)
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        isNewPasswordRequired,
        error,
        login,
        loginAsGuest,
        completeNewPassword,
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
