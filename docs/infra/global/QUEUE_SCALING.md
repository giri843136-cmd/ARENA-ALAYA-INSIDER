# Queue Scaling (BullMQ Global)

- Workers deployed regionally via Vercel or dedicated compute.
- Primary region runs AI-heavy queues (high cost, high value).
- Regional workers run email, notifications, search sync, light recommendations.
- Cross-region job routing for expensive AI (route to lowest-cost healthy provider region).
- Backpressure: pause ingestion when queue depth or DLQ grows beyond thresholds.
- Dead-letter + retry with exponential backoff + jitter.
- Priority queues for critical publishing vs. background refresh.
- Monitoring: depth per queue per region, processing rate, error rate, DLQ size.

Auto-scale workers based on queue length + latency SLOs.
