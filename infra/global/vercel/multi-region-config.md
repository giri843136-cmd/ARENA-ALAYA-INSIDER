# Vercel Multi-Region Configuration Notes

- Primary production deployment in US.
- Edge functions automatically routed globally.
- Use Vercel Regions for serverless functions when needed (us-east-1, eu-west-1, ap-southeast-1).
- Canary deployments via separate targets + traffic splitting at edge.
- Environment variables can be scoped per target (production, staging, preview).

For true multi-region app servers (if moving beyond pure Vercel Functions), deploy separate Vercel projects per region and use global load balancer / DNS steering.
