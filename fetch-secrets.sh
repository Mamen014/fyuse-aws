#!/bin/bash

set -e

# Name of the secret in AWS Secrets Manager
SECRET_NAME="APIcredentials"
REGION="ap-southeast-2"

echo "🔐 Fetching secrets from AWS Secrets Manager: $SECRET_NAME"

# Fetch the secret string (as raw JSON)
SECRET_JSON=$(aws secretsmanager get-secret-value \
  --secret-id "$SECRET_NAME" \
  --region "$REGION" \
  --query SecretString \
  --output text)

if [ -z "$SECRET_JSON" ]; then
  echo "❌ No secrets found for $SECRET_NAME"
  exit 1
fi

# Output secrets to .env format
echo "$SECRET_JSON" | jq -r 'to_entries[] | "\(.key)=\(.value)"' > .env

echo "✅ Secrets written to .env"
cat .env | sed 's/./*/g' # Mask output
