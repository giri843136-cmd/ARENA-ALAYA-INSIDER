# Global Runbook: Primary Region Failure

## Detection
- Automated: /api/ops/global-status reports primary as degraded + on-call paged.
- Manual: Users report slowness or errors from specific geographies.

## Immediate Actions (0-5 min)
1. Confirm via status page and internal dashboard.
2. Declare incident.
3. Initiate automated or manual traffic shift to secondary region.
4. Page on-call SRE + platform lead.

## Recovery Steps
See scripts/global/failover-primary-region.sh

## Communication
- Update public status page every 15 minutes.
- Internal updates in #incidents.

## Post-Incident
Full post-mortem within 48 hours. Update this runbook with lessons.
