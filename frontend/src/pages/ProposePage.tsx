import { useState, type FormEvent } from 'react'
import { Header } from '../components/Header'
import { getCurrentSession } from '../auth/cognito'

// テンプレートの実体はS3(templates/proposal-form.xlsx)。CloudFrontがバケット直下を
// 配信するため、フロントエンドの公開先と同一オリジンのルート相対パスで参照できる。
const TEMPLATE_PATH = '/templates/proposal-form.xlsx'

// 提案フォーム投稿APIのエンドポイント（terraform outputs の submission_api_endpoint）。
// 環境ごとに変わるAWSリソースのIDを含むため、他のAWS依存設定と同様にビルド時の環境変数で渡す
const SUBMISSION_API_ENDPOINT = import.meta.env.VITE_SUBMISSION_API_ENDPOINT

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; url: string }
  | { status: 'error'; message: string }

export function ProposePage() {
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<SubmitState>({ status: 'idle' })

  // ゲストアカウントによる送信は、このページでは止めない。送信するとLambda側が403を返し、
  // 下のエラー表示にそのメッセージ（「ゲストアカウントは提案できません」）がそのまま出る

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!file) return

    setState({ status: 'submitting' })
    try {
      if (!SUBMISSION_API_ENDPOINT) {
        setState({ status: 'error', message: '投稿APIが設定されていません' })
        return
      }

      // APIのCognitoオーソライザーはIDトークンのaudクレーム（アプリクライアントID）を
      // 見る設定のため、アクセストークンではなくIDトークンを使う
      const session = await getCurrentSession()
      if (!session) {
        setState({ status: 'error', message: 'ログインが必要です。再度ログインしてください' })
        return
      }
      const idToken = session.getIdToken().getJwtToken()

      // API Gateway(HTTP API)はバイナリボディを自動でbase64エンコードしてLambdaに渡すため、
      // ここでの手動エンコードは不要。Fileをそのままbodyに渡す
      const response = await fetch(SUBMISSION_API_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type':
            file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        body: file,
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setState({ status: 'error', message: data?.message ?? '送信に失敗しました' })
        return
      }

      setState({ status: 'success', url: data.url })
    } catch {
      setState({
        status: 'error',
        message: '通信エラーが発生しました。ネットワーク状態を確認してください',
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">ナレッジ提案</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          下記のテンプレート（Excel）に記入し、アップロードしてください。各項目にカーソルを合わせると入力のヒントが表示されます。
        </p>

        <a
          href={TEMPLATE_PATH}
          download
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-900 transition hover:border-gray-400 hover:shadow-sm dark:border-gray-800 dark:text-gray-100 dark:hover:border-gray-600"
        >
          提案フォーム（Excel）をダウンロード
        </a>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 rounded-lg border border-gray-200 p-6 dark:border-gray-800"
        >
          <div>
            <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
              記入済みの提案フォーム（.xlsx）
            </label>
            <input
              type="file"
              accept=".xlsx"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 dark:text-gray-400 dark:file:border-gray-700 dark:file:bg-gray-800 dark:file:text-gray-300"
            />
          </div>

          <button
            type="submit"
            disabled={!file || state.status === 'submitting'}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
          >
            {state.status === 'submitting' ? '送信中...' : '送信'}
          </button>

          {state.status === 'success' && (
            <p className="text-sm text-green-700 dark:text-green-400">
              PRを作成しました:{' '}
              <a href={state.url} target="_blank" rel="noreferrer" className="underline">
                {state.url}
              </a>
            </p>
          )}
          {state.status === 'error' && (
            <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
          )}
        </form>
      </main>
    </div>
  )
}
