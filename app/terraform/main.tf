variable "google_project" {}
variable "google_credentials" {
    default = ""
}
variable "bucket_name" {}
variable "bucket_location" {
  default = ""
}
variable "app_location" {
  default = ""
}

output "bucket_url" {
  value = "gs://${var.bucket_name}"
}

terraform {
  backend "gcs" {
    bucket  = "dfdfdfdfue-terraform"
    prefix  = "state"
  }
}

provider "google" {
  credentials = var.google_credentials
  project = var.google_project
}

resource "google_storage_bucket" "app-store" {
  name = var.bucket_name
  location = var.bucket_location
  storage_class = "MULTI_REGIONAL"
  bucket_policy_only = true

  website {
    main_page_suffix = "index.html"
    not_found_page = "404.html"
  }
}

resource "google_storage_bucket_iam_member" "app-store-acl" {
  bucket = "${google_storage_bucket.app-store.name}"
  role = "roles/storage.objectViewer"
  member = "allUsers"
}

resource "google_app_engine_application" "app" {
  count = "${var.app_location != "" ? 1 : 0}"
  location_id = var.app_location
}
