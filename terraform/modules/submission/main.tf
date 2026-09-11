# 記事投稿の受け付け（現状: 提案フォームExcel受け取り → Markdown変換 → GitHub Appで
# 認証しPR作成）を担うモジュール。将来、添付ファイル対応など投稿まわりの機能が増えても
# 同じモジュールにまとめられるよう、cdn/auth/cicd-access と同様に役割単位の名前にしている。
#
# 秘密鍵(.pem)の値そのものはTerraform管理外。aws_secretsmanager_secretは空の入れ物のみを
# 作成し、実際の値は `aws secretsmanager put-secret-value` 等で手動投入する運用とする
# （state/gitに鍵の値を載せないため）。App ID・Installation IDは秘密情報ではないため
# Lambdaの環境変数に直接持たせる。

resource "aws_secretsmanager_secret" "github_app_private_key" {
  name        = "synapush-submission-github-app-key"
  description = "記事PR作成用GitHub Appの秘密鍵（.pem）。値はTerraform外で手動投入する"
}

# Lambdaのデプロイパッケージ。事前に lambda/submission で `npm run build` を実行し、
# dist/ を生成しておく必要がある（Terraformはビルドを行わず、成果物を zip するだけ）。
data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = "${path.module}/../../../lambda/submission/dist"
  output_path = "${path.module}/../../../lambda/submission/dist.zip"
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/synapush-submission"
  retention_in_days = 30
}

data "aws_iam_policy_document" "lambda_trust" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda" {
  name               = "synapush-submission-lambda"
  assume_role_policy = data.aws_iam_policy_document.lambda_trust.json
}

data "aws_iam_policy_document" "lambda_permissions" {
  statement {
    sid       = "AllowReadGithubAppKey"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [aws_secretsmanager_secret.github_app_private_key.arn]
  }

  statement {
    sid       = "AllowWriteOwnLogs"
    actions   = ["logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["${aws_cloudwatch_log_group.lambda.arn}:*"]
  }
}

resource "aws_iam_role_policy" "lambda" {
  name   = "synapush-submission-lambda-permissions"
  role   = aws_iam_role.lambda.id
  policy = data.aws_iam_policy_document.lambda_permissions.json
}

resource "aws_lambda_function" "submission" {
  function_name    = "synapush-submission"
  role             = aws_iam_role.lambda.arn
  runtime          = "nodejs22.x"
  handler          = "index.handler"
  filename         = data.archive_file.lambda.output_path
  source_code_hash = data.archive_file.lambda.output_base64sha256
  timeout          = 30

  environment {
    variables = {
      GITHUB_REPOSITORY                 = var.github_repository
      GITHUB_DEFAULT_BRANCH             = var.github_default_branch
      GITHUB_APP_ID                     = var.github_app_id
      GITHUB_APP_INSTALLATION_ID        = var.github_app_installation_id
      GITHUB_APP_PRIVATE_KEY_SECRET_ARN = aws_secretsmanager_secret.github_app_private_key.arn
    }
  }

  depends_on = [aws_cloudwatch_log_group.lambda]
}

resource "aws_apigatewayv2_api" "http" {
  name          = "synapush-submission"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http.id
  name        = "$default"
  auto_deploy = true
}

# 既存のCognitoユーザープール（authモジュール）でログイン済みのユーザーのみ呼び出せるようにする
resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.http.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "cognito"

  jwt_configuration {
    audience = [var.user_pool_client_id]
    issuer   = "https://cognito-idp.ap-northeast-1.amazonaws.com/${var.user_pool_id}"
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.submission.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "post_proposals" {
  api_id             = aws_apigatewayv2_api.http.id
  route_key          = "POST /proposals"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_lambda_permission" "apigateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.submission.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}
