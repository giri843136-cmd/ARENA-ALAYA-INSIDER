# ALAYA INSIDER - Infrastructure as Code (Terraform)
# Production-ready skeleton. Expand with modules as needed.

terraform {
  required_version = ">= 1.7"
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.15"
    }
    neon = {
      source  = "terraform-community-providers/neon"
      version = "~> 0.3"
    }
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
}

provider "neon" {
  api_key = var.neon_api_key
}

# Vercel Project
resource "vercel_project" "alaya" {
  name      = "alaya-insider"
  framework = "nextjs"

  git_repository = {
    type = "github"
    repo = "your-org/alaya-insider"
  }

  environment = [
    {
      key    = "NODE_ENV"
      value  = "production"
      target = ["production"]
    },
    {
      key    = "DATABASE_URL"
      value  = var.database_url
      target = ["production"]
    }
  ]
}

# Neon Postgres (or use Vercel Postgres / Supabase)
resource "neon_project" "alaya_db" {
  name = "alaya-insider-prod"
  region_id = "aws-us-east-1"
}

# Example: Upstash Redis (or Vercel KV)
# resource "upstash_redis_database" "alaya_redis" {
#   name = "alaya-insider"
# }

variable "vercel_api_token" {}
variable "neon_api_key" {}
variable "database_url" {}
