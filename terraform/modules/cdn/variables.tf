variable "bucket_name" {
  description = "配信対象（ナレッジ本文・添付ファイル、Reactビルド成果物）を格納するS3バケット名（グローバルで一意である必要がある）"
  type        = string
  default     = "synapush-knowledge-contents"
}

variable "price_class" {
  description = "CloudFrontの配信対象エッジロケーション範囲"
  type        = string
  default     = "PriceClass_200"
}
