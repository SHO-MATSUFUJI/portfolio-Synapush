# Synapush frontend

Vite + React + TypeScript製のSPA。バックエンドサーバーは持たず、S3 + CloudFront配下の静的ファイル（`/content/manifest.json`とMarkdown本文）を直接読み、一覧・検索・詳細表示を行う。詳細は`docs/adr`と`terraform`、リポジトリ直下の`README.md`を参照。

## セットアップ

```bash
npm install
cp .env.example .env   # Cognito User Pool ID等を設定
npm run dev
```

Cognitoが未設定の場合でも、ログイン画面の「開発用：ログインをスキップしてプレビュー」ボタン（開発ビルド限定、本番ビルドには含まれない）で一覧・検索・詳細画面を確認できる。

## ビルド

```bash
npm run build
```
