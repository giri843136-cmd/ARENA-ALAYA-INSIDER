# ALAYA INSIDER — Security Operations Manual

## Enterprise Security Operations Reference

*Version: 1.0 | Last Updated: June 18, 2026 | Classification: CONFIDENTIAL*

---

## Table of Contents

1. [Security Architecture Overview](#1-security-architecture-overview)
2. [Daily Security Checklists](#2-daily-security-checklists)
3. [Secret Rotation Procedures](#3-secret-rotation-procedures)
4. [Backup & Recovery](#4-backup--recovery)
5. [Incident Response Quick Reference](#5-incident-response-quick-reference)
6. [Vulnerability Management](#6-vulnerability-management)
7. [Identity & Access Management](#7-identity--access-management)
8. [Monitoring & Alerting](#8-monitoring--alerting)
9. [Compliance Operations](#9-compliance-operations)
10. [Disaster Recovery Drills](#10-disaster-recovery-drills)
11. [Appendices](#11-appendices)

---

## 1. Security Architecture Overview

### 1.1 Defense-in-Depth Layers

```
┌──────────────────────────────────────────────────────────┐
│                    CLOUDFLARE (Edge)                      │
│  DDoS Protection · WAF (OWASP CRS) · Bot Management      │
│  Rate Limiting · SSL/TLS · Security Headers              │
├──────────────────────────────────────────────────────────┤
│              NGINX (Reverse Proxy)                        │
│  TLS Termination · Request Filtering · IP Whitelist       │
├──────────────────────────────────────────────────────────┤
│            NEXT.JS (Application Layer)                    │
│  CSP · CORS · CSRF · XSS Prevention · Rate Limiting      │
│  2FA · RBAC · Session Management · Audit Logging          │
├──────────────────────────────────────────────────────────┤
│          PRISMA / POSTGRESQL (Data Layer)                 │
│  Parameterized Queries · RLS · Encryption at Rest        │
│  Audit Tables · Connection Pooling                        │
├──────────────────────────────────────────────────────────┤
│              REDIS / UPSTASH (Cache/Queue)                │
│  Distributed Rate Limiting · Session Store · BullMQ      │
└──────────────────────────────────────────────────────────┘
```

### 1.2 Key Security Contacts

| Role | Contact | Response Time |
|------|---------|---------------|
| Security Engineer | security@alayainsider.com | 15 min (P0) |
| DevOps Lead | devops@alayainsider.com | 30 min |
| CTO (Escalation) | cto@alayainsider.com | 60 min |
| DMCA Agent | dmca@alayainsider.com | 24 hours |
| Privacy (GDPR) | privacy@alayainsider.com | 72 hours |

---

## 2. Daily Security Checklists

### 2.1 Morning Security Review (15 minutes)

```bash
#!/bin/bash
# Daily Security Health Check

echo "=== DAILY SECURITY CHECK: $(date -u) ==="

# 1. Check recent security events (last 24h)
echo "[1/5] Checking security audit logs..."
# Requires DB access — run production query
# SELECT action, severity, COUNT(*) FROM "SecurityAuditLog"
# WHERE "createdAt" > NOW() - INTERVAL '24 hours'
# GROUP BY action, severity ORDER BY severity DESC;

# 2. Verify services are healthy
echo "[2/5] Checking service health..."
curl -s https://alayainsider.com/api/health | jq '.dependencies'

# 3. Check CSP violation reports
echo "[3/5] Checking CSP violations..."
# Query SecurityAuditLog for csp_violation actions

# 4. Review login attempt anomalies
echo "[4/5] Checking login attempts..."
# Check for >10 failed attempts from same IP in 1 hour

# 5. Verify SSL certificate expiry
echo "[5/5] Checking SSL certificate..."
openssl s_client -connect alayainsider.com:443 -servername alayainsider.com 2>/dev/null \
  | openssl x509 -noout -dates -subject -issuer

echo "=== DAILY CHECK COMPLETE ==="
```

### 2.2 Weekly Security Review (30 minutes)

- [ ] Review Sentry error trends (last 7 days)
- [ ] Check WAF blocked requests in Cloudflare dashboard
- [ ] Review rate limit triggered events
- [ ] Check for unusual API usage patterns
- [ ] Verify backup completion (database + files)
- [ ] Review admin account activity logs
- [ ] Check for expired API keys or credentials
- [ ] Review dependency vulnerability reports (Snyk/GitHub Dependabot)

### 2.3 Monthly Security Review (1 hour)

- [ ] Full penetration test against staging environment
- [ ] Manual review of Access Control Lists (ACLs)
- [ ] Audit user roles and permissions
- [ ] Verify 2FA enforcement for all admin accounts
- [ ] Test backup restoration to staging
- [ ] Review and update incident response runbooks
- [ ] Run `npm audit` and `snyk test` against all dependencies
- [ ] Check for AWS/GCP/Azure credential rotation

---

## 3. Secret Rotation Procedures

### 3.1 Rotation Schedule

| Secret | Rotation Period | Last Rotated | Next Rotation |
|--------|----------------|--------------|---------------|
| NEXTAUTH_SECRET | 90 days | — | — |
| DATABASE_URL | 90 days | — | — |
| RESEND_API_KEY | 90 days | — | — |
| CLOUDFLARE_API_TOKEN | 90 days | — | — |
| GOOGLE_CLIENT_SECRET | 180 days | — | — |
| ANTHROPIC_API_KEY | 90 days | — | — |
| OPENAI_API_KEY | 90 days | — | — |
| Vault tokens | 30 days | — | — |

### 3.2 Rotation Procedure

```bash
# Step 1: Generate new secret
NEXTAUTH_SECRET=$(openssl rand -base64 48)

# Step 2: Update environment (all environments)
# Production:
ssh alaya-prod "cd /opt/alaya-insider && \
  sed -i 's/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=$NEXTAUTH_SECRET/' .env && \
  pm2 restart all"

# Step 3: Verify old sessions still work (should see gradual session refresh)
# Step 4: Invalidate old sessions after 24 hours (if needed)
# Update NextAuth session maxAge in auth.ts if immediate invalidation required

# Step 5: Log rotation
echo "[$(date -u)] Rotated NEXTAUTH_SECRET" >> /var/log/secret-rotation.log
```

### 3.3 Emergency Rotation (Compromise)

```bash
# If a secret is compromised, rotate IMMEDIATELY across all environments:
# 1. Generate new values
# 2. Update .env on production
# 3. Restart ALL services
# 4. Force session invalidation
# 5. Notify team via #security Slack channel
# 6. Post-mortem within 24 hours
```

---

## 4. Backup & Recovery

### 4.1 Backup Schedule

| Backup Type | Frequency | Retention | Storage | Size (est.) |
|-------------|-----------|-----------|---------|-------------|
| Database (pg_dump) | Daily | 30 days | S3-compatible | ~500 MB |
| Database (PITR) | Continuous | 7 days | Supabase/Neon | — |
| File system (uploads) | Daily | 30 days | S3-compatible | ~2 GB |
| Configuration (.env) | On change | Permanent | Encrypted vault | 5 KB |
| Application code | Per commit | Permanent | GitHub | ~200 MB |

### 4.2 Database Backup

```bash
#!/bin/bash
# /opt/scripts/backup-postgres.sh

BACKUP_DIR="/backups/database"
TIMESTAMP=$(date -u '+%Y%m%d_%H%M%S')
DATABASE_URL="${DATABASE_URL:-postgresql://...}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Dump database (exclude logs/temp tables for size)
pg_dump "$DATABASE_URL" \
  --exclude-table="cron_log" \
  --exclude-table="page_view_old" \
  --exclude-table="search_log_old" \
  --file="$BACKUP_DIR/alaya_full_$TIMESTAMP.sql"

# Compress
gzip "$BACKUP_DIR/alaya_full_$TIMESTAMP.sql"

# Encrypt (if storing offsite)
gpg --symmetric --cipher-algo AES256 \
  --output "$BACKUP_DIR/alaya_full_$TIMESTAMP.sql.gz.gpg" \
  "$BACKUP_DIR/alaya_full_$TIMESTAMP.sql.gz"

rm "$BACKUP_DIR/alaya_full_$TIMESTAMP.sql.gz"

# Upload to S3-compatible storage
s3cmd put "$BACKUP_DIR/alaya_full_$TIMESTAMP.sql.gz.gpg" \
  s3://alaya-backups/database/

# Cleanup old backups (30 days)
find "$BACKUP_DIR" -type f -name "*.gpg" -mtime +30 -delete

echo "[$(date -u)] Database backup completed: $TIMESTAMP"
```

### 4.3 Recovery Procedures

#### Full Database Restore
```bash
#!/bin/bash
# Emergency database restore

BACKUP_FILE="$1"
DATABASE_URL="$2"

if [ -z "$BACKUP_FILE" ] || [ -z "$DATABASE_URL" ]; then
  echo "Usage: $0 <backup-file> <database-url>"
  exit 1
fi

# Decrypt
gpg --decrypt "$BACKUP_FILE" > /tmp/restore.sql.gz

# Decompress
gunzip -c /tmp/restore.sql.gz > /tmp/restore.sql

# Terminate existing connections
psql "$DATABASE_URL" -c "
  SELECT pg_terminate_backend(pg_stat_activity.pid)
  FROM pg_stat_activity
  WHERE pg_stat_activity.datname = current_database()
    AND pid <> pg_backend_pid();"

# Restore
psql "$DATABASE_URL" < /tmp/restore.sql

# Cleanup
rm /tmp/restore.sql /tmp/restore.sql.gz

echo "[$(date -u)] Database restore completed from: $BACKUP_FILE"

# Verify
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM \"User\";"
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM \"Product\";"
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM \"Article\";"
```

#### Point-in-Time Recovery (PITR)
For Supabase/Neon, use the built-in PITR feature:
1. Go to Dashboard → Database → Backups
2. Select restore point (time before incident)
3. Create new branch for restore
4. Verify data integrity
5. Update DATABASE_URL to point to restored branch
6. Promote branch to primary

---

## 5. Incident Response Quick Reference

### 5.1 P0: Critical Incident (Site Down / Data Breach)

```
1. DETECT (0-5 min)
   - Verify alert in PagerDuty/Sentry
   - Confirm not a false positive
   - Declare P0 in #incident channel

2. CONTAIN (5-30 min)
   - If security breach: isolate affected systems
   - If DDoS: enable Cloudflare Under Attack Mode
   - If data loss: stop all writes, snapshot DB
   - Revoke compromised credentials immediately

3. ASSESS (30-60 min)
   - Identify scope and impact
   - Document timeline
   - Legal: determine notification requirements

4. ERADICATE (1-4 hours)
   - Remove root cause
   - Restore from clean backup
   - Rotate ALL secrets

5. RECOVER (4-8 hours)
   - Restore services
   - Verify security controls
   - Monitor for recurrence

6. POST-MORTEM (24-48 hours)
   - Root cause analysis
   - Update runbooks
   - Implement preventive measures
```

### 5.2 Incident Command Structure

```
Incident Commander (IC)     — Makes decisions, coordinates
  └── Security Lead          — Investigates, contains
  └── Engineering Lead       — Implements fixes
  └── Communications Lead    — Internal/external updates
  └── Scribe                — Documents timeline
```

### 5.3 Communication Templates

See `INCIDENT_RESPONSE_PLAN.md` for full templates including:
- Internal Slack alerts
- User-facing status page
- Regulatory breach notification
- Post-incident report

---

## 6. Vulnerability Management

### 6.1 Dependency Scanning

```bash
# Daily (automated in CI/CD)
npm audit --production
snyk test --all-projects
npx grype . --fail-on=high

# Remediation SLAs
# - Critical CVEs: Patch within 24 hours
# - High CVEs: Patch within 7 days
# - Medium CVEs: Patch within 30 days
# - Low CVEs: Next sprint
```

### 6.2 Penetration Testing Schedule

| Type | Frequency | Tool | Scope |
|------|-----------|------|-------|
| Automated SAST | Every PR | ESLint, SonarQube | Code quality |
| Automated DAST | Daily (staging) | OWASP ZAP | All endpoints |
| Dependency scan | Daily | Snyk, Dependabot | All packages |
| Secret scanning | Every push | TruffleHog, Gitleaks | All commits |
| Full pentest | Quarterly | External firm | Full application |
| Bug bounty | Continuous | security.txt | Responsible disclosure |

### 6.3 Common Vulnerability Remediation

| Vulnerability | Fix | Test |
|--------------|-----|------|
| XSS | DOMPurify + CSP | OWASP ZAP XSS rules |
| SQLi | Prisma (parameterized) | Test with ' OR 1=1 -- |
| CSRF | Double-submit cookie | Missing header test |
| IDOR | Authorization check | Change IDs in URL |
| Rate limit bypass | Redis-based rate limiter | Scripted burst test |
| Missing security headers | next.config.ts headers | securityheaders.com |
|---|---|---|

---

## 7. Identity & Access Management

### 7.1 Role Definitions

| Role | Permissions | MFA Required | Approval |
|------|-------------|--------------|----------|
| GUEST | View public content | No | Automatic |
| USER | View + favorite + comment | No (optional) | Self-signup |
| EDITOR | Create/edit content | Yes | Admin approval |
| SENIOR_EDITOR | + Delete + AI workspace | Yes | Admin approval |
| ADMIN | + Manage affiliates + revenue | Yes | Super Admin |
| SUPER_ADMIN | Full system access | Yes | In-person |

### 7.2 User Provisioning

```sql
-- Grant editor role to new team member
INSERT INTO "UserRole" ("userId", "role") VALUES ('user_id', 'EDITOR');

-- Verify permissions
SELECT r.role, p.permission
FROM "UserRole" r
CROSS JOIN LATERAL (
  SELECT unnest( -- Map role to permissions
    CASE r.role
      WHEN 'EDITOR' THEN ARRAY['READ_PRODUCT','WRITE_PRODUCT','READ_ARTICLE','WRITE_ARTICLE','READ_BRAND']
      ELSE ARRAY[]::text[]
    END
  ) AS permission
) p
WHERE r."userId" = 'user_id';
```

### 7.3 Access Reviews

- [ ] **Monthly:** Review all admin accounts and API keys
- [ ] **Quarterly:** Full user role audit
- [ ] **On termination:** Immediate account deactivation + session invalidation

---

## 8. Monitoring & Alerting

### 8.1 Critical Alerts

| Alert | Threshold | Channel | Response |
|-------|-----------|---------|----------|
| Site down | HTTP 503 > 5 min | PagerDuty + SMS | P0 |
| 5xx error rate | >5% of traffic | Slack #alerts | P1 |
| Failed login spike | >50/hr from same IP | Slack #security | P1 |
| CSP violation spike | >100/hr | Slack #security | P2 |
| Cost anomaly | >200% normal | Slack #engineering | P2 |
| Backup failure | No backup >24h | Slack #ops | P2 |
| SSL expiry | <14 days | Slack #ops | P1 |

### 8.2 Monitoring Stack

```
┌──────────────┐     ┌──────────┐     ┌──────────┐
│  Sentry       │────▶│  Slack   │     │          │
│  (Errors)     │     │  Alerts  │     │  PagerDuty│
├──────────────┤     ├──────────┤     │ (Critical)│
│  Cloudflare   │────▶│ Grafana  │     │          │
│  (WAF/DDoS)   │     │  (Dashboard)    │          │
├──────────────┤     │          │     └──────────┘
│  UptimeRobot  │────▶│          │
│  (Health)     │     └──────────┘
├──────────────┤
│  PM2 Logs    │────▶ Loki / Logtail (Log aggregation)
└──────────────┘
```

---

## 9. Compliance Operations

### 9.1 GDPR Procedures

**Data Subject Access Request (DSAR):**
1. User submits request via email or API (`/api/v1/user/data`)
2. Verify identity (authentication required)
3. Export all user data within 30 days
4. Deliver in machine-readable JSON format
5. Log request in audit trail

**Right to be Forgotten:**
1. User submits deletion request with confirmation
2. Verify identity and obtain explicit consent
3. Execute cascading deletion (preserves anonymized content)
4. Confirm deletion and log in audit trail
5. Notify user of completion within 30 days

### 9.2 CCPA Procedures

**Opt-Out of Sale:**
1. User clicks "Do Not Sell My Personal Information" link
2. Cookie consent banner manages preferences
3. Disable all tracking/analytics cookies
4. Log opt-out request

### 9.3 FTC Affiliate Disclosure

All affiliate links MUST include:
- `rel="nofollow sponsored"`
- Visible disclosure near the link
- "We may earn a commission if you purchase through our links"
- Configurable per geo (different regulations per country)

---

## 10. Disaster Recovery Drills

### 10.1 Quarterly DR Drill

```
Phase 1: Simulate Region Failure
1. Shut down primary database (simulated)
2. Verify failover to replica
3. Measure recovery time (target: <5 min)
4. Document lessons learned

Phase 2: Simulate Data Corruption
1. Revert to previous day's backup
2. Verify data integrity
3. Identify lost data (if any)
4. Test point-in-time recovery

Phase 3: Simulate DDoS Attack
1. Enable Cloudflare Under Attack Mode
2. Verify legitimate users can still access
3. Check monitoring alerts fire correctly
4. Measure performance impact
```

### 10.2 Annual Full DR Drill

- Restore entire infrastructure from scratch
- Deploy application from backup + git
- Verify all services: DB, Redis, Typesense, BullMQ
- Run full production verification script
- Time the entire process (target: <2 hours)

---

## 11. Appendices

### A. `.env` Template (Production)

```bash
# Required
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
NEXTAUTH_SECRET="<64-char-random>"
NEXTAUTH_URL="https://alayainsider.com"
NEXT_PUBLIC_SITE_URL="https://alayainsider.com"

# Auth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
PRIMARY_ADMIN_PASSWORD="<strong-password>"

# API Keys
RESEND_API_KEY="re_..."
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-proj-..."
AMAZON_ASSOCIATE_TAG="alaya0a-20"

# Infrastructure
SENTRY_DSN="https://...@oXXXXX.ingest.sentry.io/XXXXXX"
CLOUDFLARE_API_TOKEN="..."
CLOUDFLARE_ZONE_ID="..."
```

### B. Emergency Commands Reference

```bash
# Enable Cloudflare Under Attack Mode
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/security_level" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"value": "under_attack"}'

# Purge Cloudflare cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $TOKEN" \
  --data '{"purge_everything": true}'

# Restart application
cd /opt/alaya-insider && pm2 restart all

# Force refresh all sessions (invalidate)
redis-cli KEYS "session:*" | xargs redis-cli DEL

# Emergency DB connection kill
psql "$DATABASE_URL" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active';"
```

### C. Security Tools & Versions

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 22.x | Runtime |
| PostgreSQL | 16.x | Database |
| Redis | 7.x | Cache/Queue |
| Nginx | 1.26.x | Reverse proxy |
| Cloudflare | — | CDN/WAF |
| Sentry | 10.x | Error tracking |
| Upstash Redis | — | Rate limiting |
| BullMQ | 5.x | Background jobs |
| Typesense | 27.x | Full-text search |

### D. Security Scorecard

| Category | Current Score | Target | Status |
|----------|--------------|--------|--------|
| SSL Labs | A+ | A+ | ✅ |
| securityheaders.com | A+ | A+ | ✅ |
| OWASP Top 10 | 0 critical | 0 | ✅ |
| Dependency CVEs | 0 critical | 0 | ✅ |
| Uptime (30d) | 99.99% | 99.99% | ✅ |

---

*This document is maintained by the ALAYA INSIDER Security Team.*
*For questions or updates, contact security@alayainsider.com*
