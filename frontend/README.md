# Synapush frontend

Vite + React + TypeScript製のSPA。バックエンドサーバーは持たず、S3 + CloudFront配下の静的ファイル（`/content/manifest.json`とMarkdown本文）を直接読み、一覧・検索・詳細表示を行う。詳細は`docs/adr`と`terraform`、リポジトリ直下の`README.md`を参照。

## セットアップ

```bash
npm install
cp .env.example .env   # Cognito User Pool ID等を設定
npm run dev
```

ログイン画面より先（一覧・検索・詳細画面）を確認するには、`.env`にCognito User Pool ID等の実値を設定し、実際のログイン（または設定済みのゲストアカウント）が必要。

## ビルド

```bash
npm run build
```
