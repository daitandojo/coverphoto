#!/usr/bin/env bash
# Deploy CoverPhoto to Vercel
# Usage: VERCEL_TOKEN=<token> bash scripts/deploy.sh
# Get a token from https://vercel.com/account/tokens

set -euo pipefail

if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "ERROR: VERCEL_TOKEN is required."
  echo "Get one at https://vercel.com/account/tokens"
  echo ""
  echo "Usage: VERCEL_TOKEN=<token> bash scripts/deploy.sh"
  exit 1
fi

PROJECT="coverphoto"
SCOPE="daitandojo"

echo "🔍 Linking project..."
npx vercel link --yes --token "$VERCEL_TOKEN" --scope "$SCOPE" --project "$PROJECT" 2>/dev/null || true

echo "🔧 Setting environment variables..."
for var_line in $(cat .env.local | grep -v "^#" | grep -v "^$"); do
  key="${var_line%%=*}"
  value="${var_line#*=}"
  npx vercel env add "$key" production --token "$VERCEL_TOKEN" --scope "$SCOPE" <<< "$value" 2>/dev/null || true
done

echo "🚀 Deploying to Vercel..."
npx vercel deploy --prod --yes --token "$VERCEL_TOKEN" --scope "$SCOPE"

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Go to Vercel dashboard → Your project → Settings → Environment Variables"
echo "2. Verify all env vars are set"
echo "3. In Google Cloud Console, add the Vercel URL to authorized redirect URIs"
echo "4. In the Neon dashboard, allowlist Vercel's IP range"
