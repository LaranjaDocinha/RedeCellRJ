provider "aws" {
  region = "us-east-1" # Example region
}

resource "aws_s3_bucket" "example_bucket" {
  bucket = "my-unique-terraform-example-bucket-12345" # Replace with a globally unique name
  acl    = "private"

  tags = {
    Environment = "Dev"
    Project     = "RedecellRJ"
  }
}

output "bucket_name" {
  value = aws_s3_bucket.example_bucket.bucket
}
