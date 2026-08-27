# IAM OIDC: GitHub Actions（CD/mainマージ後のデプロイ）からAWSへ接続するためのロール

resource "aws_iam_openid_connect_provider" "github_actions" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
}

data "aws_iam_policy_document" "content_deploy_trust" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github_actions.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # mainブランチへのマージ後に実行されるワークフローからのみ引き受け可能にする（CI=PR時はAWSアクセス自体が不要なため対象外）
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repository}:ref:refs/heads/${var.github_branch}"]
    }
  }
}

resource "aws_iam_role" "content_deploy" {
  name               = "synapush-content-deploy"
  assume_role_policy = data.aws_iam_policy_document.content_deploy_trust.json
}

data "aws_iam_policy_document" "content_deploy_permissions" {
  statement {
    sid       = "AllowListBucket"
    actions   = ["s3:ListBucket"]
    resources = [var.bucket_arn]
  }

  statement {
    sid       = "AllowSyncObjects"
    actions   = ["s3:PutObject", "s3:DeleteObject"]
    resources = ["${var.bucket_arn}/*"]
  }

  statement {
    sid       = "AllowCloudFrontInvalidation"
    actions   = ["cloudfront:CreateInvalidation"]
    resources = [var.cloudfront_distribution_arn]
  }
}

resource "aws_iam_role_policy" "content_deploy" {
  name   = "synapush-content-deploy-permissions"
  role   = aws_iam_role.content_deploy.id
  policy = data.aws_iam_policy_document.content_deploy_permissions.json
}
