output "content_deploy_role_arn" {
  description = "GitHub ActionsがCD（S3同期+CloudFrontキャッシュ削除）で引き受けるIAMロールのARN"
  value       = aws_iam_role.content_deploy.arn
}
