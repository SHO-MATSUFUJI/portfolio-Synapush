output "user_pool_id" {
  description = "CognitoユーザープールID"
  value       = aws_cognito_user_pool.main.id
}

output "user_pool_client_id" {
  description = "CognitoアプリクライアントID"
  value       = aws_cognito_user_pool_client.web.id
}
