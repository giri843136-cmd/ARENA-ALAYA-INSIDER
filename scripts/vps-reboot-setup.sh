#!/bin/bash
# Run this AFTER VPS reboot — fixes everything in one shot

export PATH="/home/u131951911/.nvm/versions/node/v22.22.3/bin:/opt/alt/alt-nodejs22/root/usr/bin:$PATH"

cd ~/alaya-insider

echo "=== 1. Fix permissions ==="
chmod -R +x /home/u131951911/.nvm/versions/node/v22.22.3/bin/
chmod -R +x node_modules/.bin/
chmod -R +x .next/server/

echo "=== 2. Generate Prisma engine for Linux ==="
npx prisma generate 2>&1

echo "=== 3. Kill old processes ==="
pkill -f "next" 2>/dev/null
sleep 2

echo "=== 4. Start app ==="
nohup /home/u131951911/.nvm/versions/node/v22.22.3/bin/node node_modules/.bin/next start -p 3000 > ~/app.log 2>&1 &

sleep 15

echo "=== 5. Verify ==="
curl -s http://localhost:3000/api/auth/session
echo ""
curl -s http://localhost:3000/api/ops/health | head -c 100
echo ""

echo "=== DONE ==="
echo "Login at https://alayainsider.com/auth/signin"
echo "Email: alayainsider@gmail.com"
echo "Password: AlayaAdmin2026!"
