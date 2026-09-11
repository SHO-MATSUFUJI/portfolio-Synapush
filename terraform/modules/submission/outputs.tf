output "api_endpoint" {
  description = "提案フォーム送信先のAPIエンドポイント（フロントエンドから呼び出すURL）"
  value       = "${aws_apigatewayv2_api.http.api_endpoint}/proposals"
}

output "github_app_private_key_secret_arn" {
  description = "GitHub App秘密鍵(.pem)を手動投入するSecrets ManagerシークレットARN"
  value       = aws_secretsmanager_secret.github_app_private_key.arn
}

output "lambda_function_name" {
  description = "Lambda関数名（コード更新時の aws lambda update-function-code 対象）"
  value       = aws_lambda_function.submission.function_name
}
