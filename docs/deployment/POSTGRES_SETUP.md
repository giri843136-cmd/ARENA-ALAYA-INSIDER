# ALAYA INSIDER — PostgreSQL Production Setup

## Supported Providers
- Hostinger PostgreSQL (managed)
- Neon PostgreSQL (recommended)
- Self-hosted PostgreSQL

## Hostinger Managed
1. VPS panel → Databases → Create PostgreSQL.
2. Copy host, port, user, password, db name.
3. Connection string:
   `postgresql://user:pass@host:5432/alaya_insider?schema=public&sslmode=require`

## Neon
1. neon.tech → Create project.
2. Copy connection string (includes SSL).
3. Use in `.env`.

## Self-hosted
```bash
apt install postgresql postgresql-contrib
sudo -u postgres psql <<EOF
CREATE DATABASE alaya_insider;
CREATE USER alaya WITH PASSWORD 'strongpass';
GRANT ALL PRIVILEGES ON DATABASE alaya_insider TO alaya;
EOF
```

## Commands
```bash
export DATABASE_URL="..."
npx prisma generate
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

## Backups
Use `scripts/backup-postgres.sh` (cron daily).

## SSL
Always `sslmode=require` in production.

## Troubleshooting
- Connection refused → Allow VPS IP in DB firewall.
- SSL error → Add `&sslmode=require`.