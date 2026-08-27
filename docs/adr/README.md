# ADR（Architecture Decision Records）

このディレクトリには、Synapushの設計・技術選定における意思決定の記録を残す。

## 目的

- なぜその技術・構成を選んだのかを後から追跡できるようにする
- 転職ポートフォリオとして、設計判断の理由を言語化して示す

## ルール

- 1つの意思決定につき1ファイル（`NNNN-決定内容の要約.md`）
- 番号は連番（0001, 0002, ...）で欠番・変更なし
- 決定を覆した場合も既存ファイルは削除せず、ステータスを更新するか新しいADRで置き換える
- テンプレートは [`template.md`](./template.md) を使用

## 一覧

| No. | タイトル | ステータス |
| --- | --- | --- |
| [0001](./0001-record-architecture-decisions.md) | ADRで意思決定を記録する | Accepted |
| [0002](./0002-use-terraform-for-infra.md) | インフラ管理にTerraformを使う | Accepted |
| [0003](./0003-split-modules-by-function.md) | モジュールを機能単位で分割する | Accepted |
| [0004](./0004-use-tokyo-region.md) | リージョンは東京（ap-northeast-1）を採用する | Accepted |
| [0005](./0005-use-oidc-for-github-actions.md) | GitHub ActionsからAWSへの接続はOIDCで行う | Accepted |
| [0006](./0006-cognito-admin-only-signup.md) | Cognitoの自己サインアップを無効化し、管理者作成のみとする | Accepted |
| [0007](./0007-cognito-spa-direct-auth-no-hosted-ui.md) | Cognito Hosted UIは使わず、SPAからSRP認証で直接呼び出す | Accepted |
