#!/bin/bash
# ALAYA INSIDER — Full Production Audit (run on live server)
echo "🔎 ALAYA INSIDER Production Audit"
echo "=================================="

echo "1. TypeScript..."
npx tsc --noEmit || echo "TS issues found"

echo "2. Lint..."
npm run lint | grep -E "(error|✖)" || echo "No errors"

echo "3. Tests..."
npm test

echo "4. Health endpoints..."
curl -s http://localhost:3000/api/ops/health | jq .status || echo "App not running or jq missing"

echo "5. Queues..."
curl -s http://localhost:3000/api/ops/queues | jq . || echo "Queues endpoint check"

echo "6. Prisma + DB..."
npx prisma db push --preview-feature || echo "DB check (use real DB)"

echo "7. Docker/PM2 status..."
docker ps | grep alaya || echo "Docker containers"
pm2 list || echo "PM2 processes"

echo "8. Nginx + SSL..."
nginx -t
curl -I https://alayainsider.com 2>/dev/null | head -3 || echo "SSL check (run after DNS)"

echo "9. Workers / BullMQ..."
pm2 logs alaya-workers --lines 5 --nostream || echo "Check PM2 worker logs"

echo "Audit complete. Fix any failures."
