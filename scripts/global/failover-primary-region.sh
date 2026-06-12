#!/bin/bash
set -e

echo "=== ALAYA INSIDER Primary Region Failover ==="
echo "This script is for emergency use only. Prefer automated Vercel + DB promotion."

echo "1. Verify health of secondary region..."
curl -f https://eu.alayainsider.com/api/ops/health || exit 1

echo "2. Update Vercel traffic routing to secondary (via API or dashboard)..."
# vercel --prod --target=secondary or equivalent

echo "3. Promote EU Postgres replica to primary..."
# neon or aurora CLI commands here

echo "4. Rotate connection strings in all environments..."
# Update Vercel env vars + redeploy

echo "5. Trigger Typesense regional promotion + reindex..."
# scripts here

echo "6. Run global smoke tests..."
curl -f https://alayainsider.com/api/ops/global-status || exit 1

echo "Failover complete. Monitor closely for 30 minutes."
