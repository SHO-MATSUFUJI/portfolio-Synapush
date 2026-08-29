import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
} from 'amazon-cognito-identity-js'

let userPool: CognitoUserPool | null = null

// UserPoolId/ClientIdが未設定の環境（ローカルでUI確認だけしたい場合など）でもアプリ全体が
// クラッシュしないよう、Cognito接続は実際にログインを試みたタイミングまで遅延させる
function getUserPool(): CognitoUserPool {
  if (userPool) return userPool

  const UserPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID
  const ClientId = import.meta.env.VITE_COGNITO_CLIENT_ID
  if (!UserPoolId || !ClientId) {
    throw new Error('Cognitoが未設定です（.envにVITE_COGNITO_USER_POOL_ID/CLIENT_IDが必要）')
  }

  userPool = new CognitoUserPool({
    UserPoolId,
    ClientId,
    // ログイン状態はタブを閉じたら消えるsessionStorageに保持する（localStorageより漏えい時の影響が小さい）
    Storage: window.sessionStorage,
  })
  return userPool
}

export function getCurrentSession(): Promise<CognitoUserSession | null> {
  let pool: CognitoUserPool
  try {
    pool = getUserPool()
  } catch {
    return Promise.resolve(null)
  }

  const cognitoUser = pool.getCurrentUser()
  if (!cognitoUser) return Promise.resolve(null)

  return new Promise((resolve, reject) => {
    cognitoUser.getSession((error: Error | null, session: CognitoUserSession | null) => {
      if (error) {
        reject(error)
        return
      }
      resolve(session)
    })
  })
}

export function login(email: string, password: string): Promise<CognitoUserSession> {
  const cognitoUser = new CognitoUser({ Username: email, Pool: getUserPool() })
  const authDetails = new AuthenticationDetails({ Username: email, Password: password })

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => resolve(session),
      onFailure: (error) => reject(error),
      // 管理者作成直後のユーザーは仮パスワード状態のため、この分岐に入る
      newPasswordRequired: () => {
        reject(
          new Error(
            '初回ログインにはパスワード変更が必要です。管理者にお問い合わせください。',
          ),
        )
      },
    })
  })
}

export function logout(): void {
  getUserPool().getCurrentUser()?.signOut()
}
