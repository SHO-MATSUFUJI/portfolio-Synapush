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
