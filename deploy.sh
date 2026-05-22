#!/bin/bash
set -e
cd "$(dirname "$0")"

source .env

gcloud run deploy movie-agent \
  --source . \
  --region us-central1 \
  --project "$GCP_PROJECT_ID" \
  --set-env-vars "TMDB_API_KEY=$TMDB_API_KEY" \
  --min-instances 0 \
  --max-instances 2 \
  --memory 512Mi \
  --cpu 1 \
  --concurrency 80 \
  --timeout 300 \
  --allow-unauthenticated
