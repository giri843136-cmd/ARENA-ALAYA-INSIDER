# ALAYA INSIDER — Redis Production Setup

## Supported
- Upstash Redis (recommended)
- Self-hosted Redis

## Upstash
1. upstash.com → Create Redis DB.
2. Copy Redis URL (rediss://...).
3. Set `REDIS_URL`.

## Self-hosted
```bash
apt install redis-server
systemctl enable --now redis
# Edit /etc/redis/redis.conf: requirepass + bind
```

## BullMQ
Connection auto-reconnects. Workers use it for all queues (ai, recommendations, publishing, email, search, affiliate).

## Health
Bull Board at `/admin/queues` shows queue health.

## Backups
`scripts/backup-redis.sh` (RDB snapshots).