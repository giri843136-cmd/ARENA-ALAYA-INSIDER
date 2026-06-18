#!/bin/bash
# Deploy security schema to Neon DB
# Reads DATABASE_URL from .env and runs prisma commands

set -e

DIR="/home/u131951911/alaya-insider"
cd "$DIR"

# Load REAL DATABASE_URL from .env
export $(grep -v '^#' .env | xargs)
export PATH="$HOME/.nvm/versions/node/v22.22.3/bin:/opt/alt/alt-nodejs18/root/usr/bin:$PATH"

echo "=== 1. Prisma generate ==="
npx prisma generate
echo "=== DONE ==="

echo "=== 2. Prisma db push (to REAL Neon DB) ==="
npx prisma db push --accept-data-loss
echo "=== DONE ==="

echo "=== 3. Verify tables ==="
node -e '
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  const r = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema=$1 AND table_name = ANY($2)", ["public", ["TwoFactorAuth","BackupCode","LoginAttempt","DelegatedAccess","SecurityAuditLog"]]);
  console.log("TABLES: " + r.rows.length + "/5");
  r.rows.forEach(x => console.log("  [OK] " + x.table_name));
  const c = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name=$1 AND column_name=$2", ["User", "passwordHash"]);
  console.log("passwordHash: " + (c.rows.length > 0 ? "EXISTS" : "MISSING"));
  await pool.end();
})();
'
echo "=== DONE ==="

echo "=== 4. Restart app ==="
pm2 restart alaya-insider 2>/dev/null || true
echo "=== DONE ==="

echo "All done."
