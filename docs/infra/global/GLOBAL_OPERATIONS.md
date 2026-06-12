# Global Operations

## On-call
- Primary on-call rotation (follow-the-sun: US → EU → APAC).
- PagerDuty or similar with escalation.
- Runbooks in this repo (runbooks/global/).

## Incident Response
1. Automated alert → on-call paged.
2. Triage in #incidents (Slack).
3. Declare incident if user impact or >15min.
4. Use status page for external communication.
5. Post-mortem within 48h (blameless, action items with owners + deadlines).

## Change Management
- All production changes via PR + required approvals for infra.
- Maintenance windows announced 48h in advance for non-emergency.
- Feature flags for risky changes.

## Capacity Planning
Quarterly review of:
- Traffic forecasts (based on historical + marketing plans)
- AI token forecasts (biggest variable cost)
- Database / search / cache headroom
- Regional growth

Tools: Internal forecasting scripts + actuals from analytics warehouse.
