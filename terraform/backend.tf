terraform {
  backend "s3" {
    bucket = "portfolio-synapush-tfstate"
    key    = "terraform/terraform.tfstate"
    region = "ap-northeast-1"
  }
}
