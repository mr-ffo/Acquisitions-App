terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  required_version = ">= 1.3.0"
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_dynamodb_table" "users" {
  name         = "Users"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  # ✅ Add attribute for email so we can query by email later
  attribute {
    name = "email"
    type = "S"
  }

  # ✅ Global Secondary Index for email queries
  global_secondary_index {
    name            = "email-index"    # Index name used from backend
    hash_key        = "email"
    projection_type = "ALL"
  }

  tags = {
    Environment = "dev"
    Project     = "acquisitions-app"
  }
}
