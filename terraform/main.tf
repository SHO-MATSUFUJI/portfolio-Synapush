module "cdn" {
  source = "./modules/cdn"
}

module "auth" {
  source = "./modules/auth"
}

module "cicd_access" {
  source = "./modules/cicd-access"

  bucket_arn                  = module.cdn.bucket_arn
  cloudfront_distribution_arn = module.cdn.cloudfront_distribution_arn
}
