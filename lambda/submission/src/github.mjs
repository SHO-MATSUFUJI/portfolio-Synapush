// GitHub Contents API / Git Data API を使い、記事1件ぶんの新規PRを作成する。
// 添付ファイルは対象外（index.md 1ファイルのみ）。

const [OWNER, REPO] = process.env.GITHUB_REPOSITORY.split('/')
const BASE_BRANCH = process.env.GITHUB_DEFAULT_BRANCH ?? 'main'

/**
 * @param {import('@octokit/rest').Octokit} octokit
 * @param {{ id: string, title: string, category: string, markdown: string }} article
 * @returns {Promise<string>} 作成したPRのURL
 */
export async function createArticlePullRequest(octokit, article) {
  const path = `content/personal/shoichi/${article.category}/${article.id}/index.md`
  const branch = `proposal/${article.id}`

  const { data: baseRef } = await octokit.git.getRef({ owner: OWNER, repo: REPO, ref: `heads/${BASE_BRANCH}` })

  await octokit.git.createRef({
    owner: OWNER,
    repo: REPO,
    ref: `refs/heads/${branch}`,
    sha: baseRef.object.sha,
  })

  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path,
    branch,
    message: `feat: 記事「${article.title}」を追加する`,
    content: Buffer.from(article.markdown, 'utf-8').toString('base64'),
  })

  const { data: pr } = await octokit.pulls.create({
    owner: OWNER,
    repo: REPO,
    base: BASE_BRANCH,
    head: branch,
    title: `feat: 記事「${article.title}」を追加する`,
    body: `提案フォーム（Excel）から自動生成された記事です。\n\nid: \`${article.id}\``,
  })

  return pr.html_url
}
