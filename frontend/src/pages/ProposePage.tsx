import { Header } from '../components/Header'

// テンプレートの実体はS3(templates/proposal-form.xlsx)。CloudFrontがバケット直下を
// 配信するため、フロントエンドの公開先と同一オリジンのルート相対パスで参照できる。
// アップロード機能（POST /proposals 連携）は未実装で、現時点ではテンプレート配布のみ行う。
const TEMPLATE_PATH = '/templates/proposal-form.xlsx'

export function ProposePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">ナレッジ提案</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          下記のテンプレート（Excel）に記入し、事務局へ提出してください。各項目にカーソルを合わせると入力のヒントが表示されます。
        </p>

        <a
          href={TEMPLATE_PATH}
          download
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-900 transition hover:border-gray-400 hover:shadow-sm dark:border-gray-800 dark:text-gray-100 dark:hover:border-gray-600"
        >
          提案フォーム（Excel）をダウンロード
        </a>

        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          アップロード機能は準備中です。記入後のファイルは事務局まで別途ご連絡ください。
        </p>
      </main>
    </div>
  )
}
