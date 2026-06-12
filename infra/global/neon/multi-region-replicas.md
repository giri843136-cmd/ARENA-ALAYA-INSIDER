# Neon Postgres Multi-Region Strategy

- Primary branch in us-east-1.
- Read replicas in eu-west-1 and ap-southeast-1.
- Use Neon's connection pooling per region.
- Monitor replica lag via Neon dashboard + custom metrics.
- On failover: promote replica via Neon API → update connection strings in Vercel (zero-downtime via env var update + redeploy).

Cross-region replication is async; design reads accordingly.
