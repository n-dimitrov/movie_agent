#!/bin/bash
set -e
cd "$(dirname "$0")"

source .env

gcloud run deploy movie-agent \
  --source . \
  --region us-central1 \
  --project "$GCP_PROJECT_ID" \
  --set-env-vars "TMDB_API_KEY=$TMDB_API_KEY,CLAUDE_CODE_USE_VERTEX=$CLAUDE_CODE_USE_VERTEX,CLOUD_ML_REGION=$CLOUD_ML_REGION,ANTHROPIC_VERTEX_PROJECT_ID=$ANTHROPIC_VERTEX_PROJECT_ID,ANTHROPIC_VERTEX_BASE_URL=$ANTHROPIC_VERTEX_BASE_URL,CLAUDE_CODE_SKIP_VERTEX_AUTH=$CLAUDE_CODE_SKIP_VERTEX_AUTH,ANTHROPIC_AUTH_TOKEN=$ANTHROPIC_AUTH_TOKEN,ANTHROPIC_MODEL=$ANTHROPIC_MODEL,GCS_BUCKET_NAME=$GCS_BUCKET_NAME,APP_BASE_URL=$APP_BASE_URL" \
  --min-instances 0 \
  --max-instances 2 \
  --memory 512Mi \
  --cpu 1 \
  --concurrency 80 \
  --timeout 300 \
  --allow-unauthenticated
