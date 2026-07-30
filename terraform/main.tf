module "cdn" {
  source = "./modules/cdn"
}

module "auth" {
  source = "./modules/auth"
}

module "cicd_access" {
  source = "./modules/cicd-access"
}
