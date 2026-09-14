variable "user_pool_id" {
  description = "APIの認証に使うCognitoユーザープールID（authモジュールのoutputを渡す）"
  type        = string
}

variable "user_pool_client_id" {
  description = "APIの認証に使うCognitoアプリクライアントID（authモジュールのoutputを渡す）"
  type        = string
}

variable "github_repository" {
  description = "記事PRの作成先GitHubリポジトリ（owner/repo形式）"
  type        = string
  default     = "SHO-MATSUFUJI/portfolio-Synapush"
}

variable "github_default_branch" {
  description = "記事PRのベースブランチ"
  type        = string
  default     = "main"
}

variable "github_app_id" {
  description = "記事PR作成に使うGitHub AppのApp ID（秘密情報ではない）"
  type        = string
  default     = "4895204"
}

variable "github_app_installation_id" {
  description = "記事PR作成に使うGitHub AppのInstallation ID（秘密情報ではない）"
  type        = string
  default     = "160547675"
}
