# 0002. インフラ管理にTerraformを使う

## ステータス

Accepted

## 決定

IaC Terraformでコード管理する。

## 理由

CloudFormationも学習したが、RaiseTechでの学習期間中、最も長く・繰り返し触れてきたのはTerraformで、モジュール分割やS3バックエンドでのstate管理、`terraform test`によるテスト記述、CICDもひと通り経験している。

まだ学習中の身であり、どちらが優れているかを語れるほどの経験はない。ただ、今の自分が一番仕組みを理解して説明できるのがTerraformであり、自分の言葉で語れることを優先し、Terraformを選んだ。
