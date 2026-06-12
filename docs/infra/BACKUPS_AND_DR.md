# Backups & Disaster Recovery

- **Postgres**: Daily full + continuous WAL (PITR to 1 minute). Cross-region replica.
- **Redis**: Regular RDB + AOF snapshots.
- **Typesense**: Cloud snapshots or volume-level backups.
- **Object Storage / Media**: Versioned + cross-region replication (Cloudinary or S3).
- **Secrets**: Never in git. Rotated on schedule. Stored in Vercel + 1Password / Doppler.

**Recovery Time Objective (RTO)**: 30 minutes for full platform.
**Recovery Point Objective (RPO)**: 5 minutes.

Run full DR drill quarterly. Document results in this runbook.
