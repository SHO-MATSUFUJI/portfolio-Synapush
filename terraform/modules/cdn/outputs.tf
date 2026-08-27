output "bucket_name" {
  description = "配信対象を格納するS3バケット名"
  value       = aws_s3_bucket.knowledge_contents.bucket
}

output "bucket_arn" {
  description = "配信対象を格納するS3バケットのARN"
  value       = aws_s3_bucket.knowledge_contents.arn
}

output "cloudfront_domain_name" {
  description = "CloudFrontディストリビューションのドメイン名"
  value       = aws_cloudfront_distribution.knowledge_contents.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFrontディストリビューションID"
  value       = aws_cloudfront_distribution.knowledge_contents.id
}

output "cloudfront_distribution_arn" {
  description = "CloudFrontディストリビューションARN（IAMポリシーでのリソース指定に使用）"
  value       = aws_cloudfront_distribution.knowledge_contents.arn
}
