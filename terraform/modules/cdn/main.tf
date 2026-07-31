# CDN: S3（ナレッジ本文・添付ファイル・Reactビルド成果物格納）+ CloudFront（OAC経由配信）

resource "aws_s3_bucket" "knowledge_contents" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_public_access_block" "knowledge_contents" {
  bucket = aws_s3_bucket.knowledge_contents.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_cloudfront_origin_access_control" "knowledge_contents" {
  name                              = "${var.bucket_name}-oac"
  description                       = "CloudFrontがS3バケットにSigV4署名付きでアクセスするためのOAC"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

resource "aws_cloudfront_distribution" "knowledge_contents" {
  enabled             = true
  comment             = "Synapushナレッジ・フロントエンド配信用ディストリビューション"
  default_root_object = "index.html"
  price_class         = var.price_class

  origin {
    domain_name              = aws_s3_bucket.knowledge_contents.bucket_regional_domain_name
    origin_id                = "s3-knowledge-contents"
    origin_access_control_id = aws_cloudfront_origin_access_control.knowledge_contents.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods          = ["GET", "HEAD"]
    target_origin_id        = "s3-knowledge-contents"
    viewer_protocol_policy  = "redirect-to-https"
    cache_policy_id         = data.aws_cloudfront_cache_policy.caching_optimized.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

data "aws_iam_policy_document" "knowledge_contents_bucket_policy" {
  statement {
    sid       = "AllowCloudFrontServicePrincipal"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.knowledge_contents.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.knowledge_contents.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "knowledge_contents" {
  bucket = aws_s3_bucket.knowledge_contents.id
  policy = data.aws_iam_policy_document.knowledge_contents_bucket_policy.json
}
