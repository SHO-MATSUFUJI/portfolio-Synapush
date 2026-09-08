# ルートで公開するoutput。GitHub Actions（deploy-content ワークフロー）の
# リポジトリ変数に設定する値をここから取得する。
#   terraform output -raw <name>

output "s3_bucket_name" {
  description = "配信対象S3バケット名（GitHub Actionsリポジトリ変数 S3_BUCKET に設定）"
  value       = module.cdn.bucket_name
}

output "cloudfront_distribution_id" {
  description = "CloudFrontディストリビューションID（同 CLOUDFRONT_DISTRIBUTION_ID に設定）"
  value       = module.cdn.cloudfront_distribution_id
}

output "content_deploy_role_arn" {
  description = "GitHub ActionsがOIDCで引き受けるデプロイ用IAMロールARN（同 AWS_DEPLOY_ROLE_ARN に設定）"
  value       = module.cicd_access.content_deploy_role_arn
}

output "frontend_deploy_role_arn" {
  description = "GitHub Actionsがフロントエンドデプロイで引き受けるIAMロールARN（同 AWS_FRONTEND_DEPLOY_ROLE_ARN に設定）"
  value       = module.cicd_access.frontend_deploy_role_arn
}

output "cognito_user_pool_id" {
  description = "CognitoユーザープールID（GitHub Actionsリポジトリ変数 VITE_COGNITO_USER_POOL_ID に設定）"
  value       = module.auth.user_pool_id
}

output "cognito_user_pool_client_id" {
  description = "CognitoアプリクライアントID（GitHub Actionsリポジトリ変数 VITE_COGNITO_CLIENT_ID に設定）"
  value       = module.auth.user_pool_client_id
}
