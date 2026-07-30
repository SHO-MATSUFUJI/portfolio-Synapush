# 0003. モジュールを機能単位で分割する

## ステータス

Accepted

## 決定

Terraformのモジュールを、S3・CloudFront・Cognito・IAMのようなリソース単位ではなく、`cdn`・`auth`・`cicd-access`という機能単位で分割する。CDN用途のS3とCloudFrontは1つの`cdn`モジュールに統合する。

## 理由

CloudFrontがOAC経由でS3にアクセスする構成は密結合であり、S3とCloudFrontを別モジュールに分けるとバケットARNやドメイン名などの値の受け渡しが増えて煩雑になる。

RaiseTechのlecture33でも`network`/`compute`/`storage`のような機能名でモジュールが統一されており、リソースが増えてもモジュール名が破綻しにくいため
