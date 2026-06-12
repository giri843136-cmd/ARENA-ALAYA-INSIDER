#!/bin/bash
# ALAYA INSIDER — Production Service Connection Verifier
# Run this on the server AFTER filling .env.production

set -e

echo "🔍 ALAYA INSIDER Production Service Verification"
echo "================================================"

source .env.production 2>/dev/null || { echo "❌ .env.production not found"; exit 1; }

# PostgreSQL
echo -n "PostgreSQL: "
if command -v psql >/dev/null; then
  PGPASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/.*:\(.*\)@.*/\1/p') psql "$DATABASE_URL" -c "SELECT 1" -t -A >/dev/null 2>&1 && echo "✅ Connected" || echo "❌ Failed (check host/user/pass)"
else
  echo "⚠️ psql client not installed (install postgresql-client)"
fi

# Redis
echo -n "Redis: "
if command -v redis-cli >/dev/null; then
  redis-cli -u "$REDIS_URL" PING 2>/dev/null | grep -q PONG && echo "✅ Connected" || echo "❌ Failed"
else
  echo "⚠️ redis-cli not installed"
fi

# Typesense
echo -n "Typesense: "
curl -s -H "X-TYPESENSE-API-KEY: $TYPESENSE_API_KEY" "https://$TYPESENSE_HOST:$TYPESENSE_PORT/health" | grep -q '"ok":true' && echo "✅ Healthy" || echo "❌ Unreachable or bad key"

# Google OAuth (just checks if vars present)
echo -n "Google OAuth: "
[ -n "$GOOGLE_CLIENT_ID" ] && [ -n "$GOOGLE_CLIENT_SECRET" ] && echo "✅ Credentials present" || echo "❌ Missing (login will be disabled)"

# Resend
echo -n "Resend: "
[ -n "$RESEND_API_KEY" ] && [[ "$RESEND_API_KEY" == re_* ]] && echo "✅ Key present" || echo "❌ Invalid or missing"

# Cloudinary
echo -n "Cloudinary: "
[ -n "$CLOUDINARY_CLOUD_NAME" ] && [ -n "$CLOUDINARY_API_KEY" ] && echo "✅ Credentials present" || echo "❌ Missing (media uploads degraded)"

# AI
echo -n "Anthropic/OpenAI: "
if [ -n "$ANTHROPIC_API_KEY" ] || [ -n "$OPENAI_API_KEY" ]; then
  echo "✅ At least one AI key present"
else
  echo "❌ No AI keys (AI Workspace will use mocks)"
fi

# Sentry
echo -n "Sentry: "
[ -n "$SENTRY_DSN" ] && echo "✅ DSN present" || echo "⚠️ Not configured (errors not reported)"

echo ""
echo "✅ Verification complete. Fix any ❌ before deploying."
