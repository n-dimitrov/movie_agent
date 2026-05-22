#!/bin/bash
set -e

BASE_URL="${1:-http://localhost:3001}"

echo "🎬 Generating Box Office Digest..."
echo "API: $BASE_URL/api/boxoffice"
echo ""

START_TIME=$(date +%s)

RESPONSE=$(curl -s -X POST "$BASE_URL/api/boxoffice")

if [ $? -ne 0 ]; then
  echo "❌ Failed to call API"
  exit 1
fi

ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
URL=$(echo "$RESPONSE" | grep -o '"url":"[^"]*' | cut -d'"' -f4)

if [ -z "$ID" ]; then
  echo "❌ Failed to generate digest:"
  echo "$RESPONSE"
  exit 1
fi

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "✅ Digest generated successfully!"
echo ""
echo "ID:  $ID"
echo "URL: $URL"
echo ""
echo "Completed in ${DURATION}s"
