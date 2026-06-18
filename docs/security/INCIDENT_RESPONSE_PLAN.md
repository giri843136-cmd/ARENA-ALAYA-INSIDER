# ALAYA INSIDER — Incident Response Plan

## 1. Incident Classification

| Level | Severity | Examples | Response Time | Reporting |
|-------|----------|----------|---------------|-----------|
| P0 | Critical | Site down, data breach, ransomware | 15 min | CEO + CTO + Security |
| P1 | High | Affiliate links broken, revenue impacted | 1 hour | Engineering Lead |
| P2 | Medium | AI cost spike, search degraded | 4 hours | Team Lead |
| P3 | Low | Minor bug, cosmetic issue | 24 hours | Ticket |

## 2. Response Team & Roles

| Role | Person | Responsibility |
|------|--------|----------------|
| Incident Commander | On-call Lead | Coordinates response, declares severity, makes Go/No-Go decisions |
| Security Lead | Security Engineer | Investigates breach, contains threat, collects forensics |
| Communications Lead | Product Manager | Internal/external updates, regulatory notifications |
| Engineering Lead | Senior Developer | Implements fix, deploys patch, validates |
| Scribe | Assigned | Timestamps all actions, maintains incident log |

## 3. Incident Response Flow

### Phase 1: Detection & Triage (0-15 min)
1. Alert received (monitoring/PagerDuty/user report)
2. Verify alert — is it real or false positive?
3. Classify severity (P0-P3)
4. Assemble response team
5. Open incident channel (#incident-YYYYMMDD)

### Phase 2: Containment (15-60 min)
**For Security Breach:**
1. Isolate affected systems (remove from load balancer)
2. Revoke compromised credentials
3. Enable aggressive rate limiting on affected endpoints
4. Take forensic snapshot of affected systems
5. Block malicious IPs at CDN/WAF level

**For Service Outage:**
1. Roll back to last known-good deployment
2. Scale up resources if under load
3. Fail over to DR region if primary is compromised
4. Verify health endpoint

**For Data Breach:**
1. Identify breach vector and scope
2. Lock down all access
3. Begin forensic investigation
4. Notify legal counsel
5. DO NOT communicate externally without legal approval

### Phase 3: Eradication (1-4 hours)
1. Identify root cause
2. Patch vulnerability
3. Remove malware/unauthorized access
4. Rotate ALL secrets (even if unaffected)
5. Run full security scan before restoration

### Phase 4: Recovery (4-8 hours)
1. Restore from clean backup
2. Verify data integrity
3. Gradually restore services
4. Monitor for recurrence
5. Validate all security controls

### Phase 5: Post-Mortem (24-48 hours)
1. Complete incident timeline
2. Root cause analysis (5 Whys)
3. Identify control gaps
4. Create action items with owners
5. Update runbooks and playbooks

## 4. Communication Templates

### Internal Alert (Slack)
```
🚨 *P0 INCIDENT* - ALAYA INSIDER
Severity: P{0-3}
Impact: {description}
Time detected: {ISO timestamp}
Lead: @{name}
Channel: #incident-{date}
Initial actions: {list}
Status: INVESTIGATING / CONTAINED / RESOLVED
```

### User-Facing Status Page
```markdown
We are currently investigating {issue}. 
Updates will be posted here every 30 minutes.
Estimated resolution: {time}.
- ALAYA INSIDER Team
```

### Regulatory Notification (Data Breach)
```
Subject: Data Security Incident Notification — ALAYA INSIDER

Dear {regulator},

ALAYA INSIDER is notifying you of a data security incident detected on {date}.

Nature of Incident: {description}
Data Affected: {categories of data}
Number of Affected Users: {count}
Current Status: {contained/investigating/resolved}
Actions Taken: {list}

Contact: security@alayainsider.com
Incident ID: INC-{YYYYMMDD}-{NNN}

This is an initial notification. A full report will follow within 72 hours.
```

## 5. Forensics Playbooks

### Web Application Compromise
```bash
# 1. Capture running processes
ps aux > /tmp/forensics/processes.txt

# 2. Network connections
netstat -tulpn > /tmp/forensics/connections.txt

# 3. Recent logins
last -10 > /tmp/forensics/logins.txt

# 4. Modified files in last 24h
find /opt/alaya-insider -mtime -1 -type f > /tmp/forensics/modified.txt

# 5. Audit logs (Prisma)
npx prisma studio --port 5556
# Export SecurityAuditLog and LoginAttempt tables
```

### Database Compromise
```bash
# 1. Check active connections
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"

# 2. Recent queries (if pg_stat_statements enabled)
psql $DATABASE_URL -c "SELECT * FROM pg_stat_statements ORDER BY last_executed DESC LIMIT 50;"

# 3. Check for unauthorized schema changes
psql $DATABASE_URL -c "SELECT * FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;"

# 4. Restore from PITR backup
# ...
```

## 6. Post-Incident Checklist

- [ ] Root cause identified and documented
- [ ] All systems restored and verified
- [ ] Security controls updated to prevent recurrence
- [ ] All credentials rotated
- [ ] Incident report filed
- [ ] Legal/compliance notified (if applicable)
- [ ] Affected users notified (if applicable)
- [ ] Runbook updated with lessons learned
- [ ] Team debrief completed

## 7. Continuous Improvement

### Monthly
- Review and update runbooks
- Rotate on-call schedule
- Test backup restoration

### Quarterly
- Full DR drill (simulate region outage)
- Tabletop exercise with full team
- Penetration test against staging
- Update compliance checklist

### Annually
- Full security audit
- Disaster recovery drill from scratch
- Bug bounty program review
- Insurance coverage review

## 8. Key Contacts

| Contact | Details |
|---------|---------|
| Security Team | security@alayainsider.com |
| DevOps Lead | devops@alayainsider.com |
| VPS Provider | Hostinger Support |
| DNS Provider | Cloudflare |
| DB Provider | Neon/PostgreSQL |
| Incident Hotline | +1-{number} |
