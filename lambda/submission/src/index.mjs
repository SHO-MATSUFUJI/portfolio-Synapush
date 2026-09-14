// API Gateway(HTTP API)から呼ばれるLambdaハンドラ。
// 提案フォーム(Excel)を受け取り → Markdownに変換 → GitHub Appで認証 → 新規記事のPRを作成する。

import { Octokit } from '@octokit/rest'
import { createAppAuth } from '@octokit/auth-app'
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { parseExcelToArticle, ValidationError } from './excel-to-article.mjs'
import { buildMarkdown } from './markdown.mjs'
import { createArticlePullRequest } from './github.mjs'

const secretsClient = new SecretsManagerClient({})

// Lambda実行環境（コンテナ）が使い回される間はキャッシュし、毎回Secrets Managerを叩かない
let cachedPrivateKey

async function getPrivateKey() {
  if (cachedPrivateKey) return cachedPrivateKey
  const { SecretString } = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: process.env.GITHUB_APP_PRIVATE_KEY_SECRET_ARN }),
  )
  cachedPrivateKey = SecretString
  return cachedPrivateKey
}

async function getOctokit() {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.GITHUB_APP_ID,
      installationId: process.env.GITHUB_APP_INSTALLATION_ID,
      privateKey: await getPrivateKey(),
    },
  })
}

function response(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

export async function handler(event) {
  if (!event.body) return response(400, { message: 'リクエストボディが空です' })

  let article
  try {
    const buffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf-8')
    article = await parseExcelToArticle(buffer)
  } catch (error) {
    if (error instanceof ValidationError) return response(400, { message: error.message })
    console.error(error)
    return response(400, { message: 'Excelの読み取りに失敗しました。ファイル形式・入力内容を確認してください' })
  }

  try {
    const markdown = buildMarkdown(article)
    const octokit = await getOctokit()
    const url = await createArticlePullRequest(octokit, { ...article, markdown })
    return response(200, { message: 'PRを作成しました', url })
  } catch (error) {
    console.error(error)
    return response(500, { message: 'PR作成中にエラーが発生しました' })
  }
}
