variable "bucket_arn" {
  description = "コンテンツ同期先S3バケットのARN（cdnモジュールのoutputを渡す）"
  type        = string
}

variable "cloudfront_distribution_arn" {
  description = "キャッシュ無効化対象CloudFrontディストリビューションのARN（cdnモジュールのoutputを渡す）"
  type        = string
}

variable "github_repository" {
  description = "OIDC信頼対象のGitHubリポジトリ（owner/repo形式）"
  type        = string
  default     = "SHO-MATSUFUJI/portfolio-Synapush"
}

variable "github_branch" {
  description = "デプロイロールの引き受けを許可するブランチ（マージ後のCD実行元）"
  type        = string
  default     = "main"
}
