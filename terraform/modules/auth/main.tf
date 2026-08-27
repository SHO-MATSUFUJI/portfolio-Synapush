# 認証: Cognitoユーザープール・アプリクライアント（社内ログイン用）

resource "aws_cognito_user_pool" "main" {
  name = var.user_pool_name

  # 自己サインアップは無効。管理者がTerraform外でユーザーを個別作成する運用のため
  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  # ログイン時のユーザー名としてメールアドレスを使う
  username_attributes = ["email"]

  # MFAは使わない（ポートフォリオ用途、デフォルトもOFF）
  mfa_configuration = "OFF"
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "${var.user_pool_name}-web-client"
  user_pool_id = aws_cognito_user_pool.main.id

  # ブラウザ（React SPA）から直接使うためシークレットは発行しない
  generate_secret = false

  # SRP認証（パスワードを平文で送らない方式）とトークンリフレッシュのみ許可。Hosted UIは使わない
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]
}
