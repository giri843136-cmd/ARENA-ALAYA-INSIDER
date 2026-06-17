# ALAYA INSIDER — Production Service Setup Guide

This guide walks you through setting up every third-party service needed for production deployment.

---

## Quick Reference

| Service | Purpose | Free Tier | Setup Link |
|---------|---------|-----------|------------|
| **Neon** | PostgreSQL database | Yes — 500MB, 100hr compute/mo | [Sign up](https://neon.tech) |
| **Upstash** | Redis (caching + queues) | Yes — 10MB, 5000 commands/day | [Sign up](https://upstash.com) |
| **Typesense Cloud** | Search engine | Developer plan | [Sign up](https://typesense.org) |
| **Cloudinary** | Image/video CDN | Yes — 25GB storage, 25GB bandwidth | [Sign up](https://cloudinary.com) |
| **Resend** | Transactional email | Yes — 100 emails/day | [Sign up](https://resend.com) |
| **Sentry** | Error monitoring | Yes — 5K events/month | [Sign up](https://sentry.io) |
| **OpenAI / Anthropic** | AI content generation | Paid (usage-based) | [OpenAI](https://platform.openai.com) / [Anthropic](https://console.anthropic.com) |
| **Google OAuth** | Admin login | Free | [Google Cloud Console](https://console.cloud.google.com) |

---

## 1. Neon (PostgreSQL)

Serverless Postgres with branching, autoscaling, and bottomless storage.

### Setup
```bash
npm install @neondatabase/serverless
```

### Env Vars
```env
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/alaya_insider?sslmode=require"
```

### Steps
1. Go to https://console.neon.tech and sign up
2. Create a new project (select region closest to your VPS)
3. Go to **Connection Details** → copy the connection string
4. Add to `.env.production` as `DATABASE_URL`
5. Run migrations: `npx prisma migrate deploy`

---

## 2. Upstash (Redis)

Serverless Redis for BullMQ queues, session caching, and rate limiting.

### Setup
```bash
npm install @upstash/redis
```

### Env Vars
```env
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"
REDIS_URL="redis://default:your-password@xxx.upstash.io:6379"
```

### Steps
1. Go to https://console.upstash.com and sign up
2. Create a **Redis** database (choose region closest to your VPS)
3. Copy the **REST URL** and **REST Token** from the dashboard
4. Add to `.env.production`
5. For BullMQ compatibility, also copy the Redis connection string

---

## 3. Typesense Cloud (Search)

Open-source alternative to Algolia — instant search with typo tolerance.

### Setup
Typesense Cloud has a developer plan that works for staging/preview.

### Env Vars
```env
TYPESENSE_HOST="xxx.a1.typesense.net"
TYPESENSE_PORT="443"
TYPESENSE_PROTOCOL="https"
TYPESENSE_API_KEY="your-api-key"
```

### Steps
1. Go to https://cloud.typesense.org and sign up
2. Create a cluster (choose the developer/launch plan)
3. Copy the **Host** and **API Key** from the cluster dashboard
4. Add to `.env.production`
5. Seed Typesense: `npx tsx scripts/search/seed-typesense.ts`

---

## 4. Cloudinary (Media CDN)

Image and video management with built-in CDN and optimization.

### Setup
```bash
npm install cloudinary
```

### Env Vars
```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="abc123def456"
```

### Steps
1. Go to https://cloudinary.com and sign up (free tier: 25GB storage)
2. From the dashboard, copy your **Cloud Name**, **API Key**, and **API Secret**
3. Add to `.env.production`

---

## 5. Resend (Email)

Transactional email API for notifications, password resets, and alerts.

### Setup
The project uses Resend for transactional emails (already in `package.json`).

### Env Vars
```env
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="alaya@alayainsider.com"
```

### Steps
1. Go to https://resend.com and sign up (free tier: 100 emails/day)
2. Verify your domain (`alayainsider.com`)
3. Create an API key from the dashboard
4. Add to `.env.production`

---

## 6. Sentry (Error Monitoring)

Application monitoring and error tracking.

### Setup
```bash
npx @sentry/wizard@latest -i nextjs
```

### Env Vars
```env
SENTRY_DSN="https://xxx@xxx.ingest.us.sentry.io/xxxxx"
SENTRY_AUTH_TOKEN="your-auth-token"
```

### Steps
1. Go to https://sentry.io and sign up (free tier: 5K events/month)
2. Create a **Next.js** project
3. Copy the **DSN** from Project Settings → Client Keys
4. Run the wizard or add env vars manually
5. Add to `.env.production`

---

## 7. AI Providers (OpenAI / Anthropic)

For AI Workspace content generation (Content Architect, SEO Strategist, etc.).

### OpenAI
```env
OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Steps:**
1. Go to https://platform.openai.com and sign up
2. Add billing and create an API key
3. Set `AI_MAX_COST_PER_TASK="0.50"` and `AI_MONTHLY_BUDGET="200"` in `.env.production`

### Anthropic (Alternative)
```env
ANTHROPIC_API_KEY="sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

The AI services use a mock provider when no API keys are configured, so the app won't crash without them.

---

## 8. Google OAuth (Admin Login)

For authenticating admin dashboard users.

### Env Vars
```env
GOOGLE_CLIENT_ID="123456789012-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxxxxxx"
NEXTAUTH_SECRET="your-64-char-random-secret"
NEXTAUTH_URL="https://alayainsider.com"
```

### Steps
1. Go to https://console.cloud.google.com → **APIs & Services** → **Credentials**
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add authorized redirect URI: `https://alayainsider.com/api/auth/callback/google`
4. Copy the **Client ID** and **Client Secret**
5. Generate a random `NEXTAUTH_SECRET`: `openssl rand -base64 64`
6. Add all to `.env.production`

---

## Complete `.env.production` Template

```env
# --- Database ---
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/alaya_insider?sslmode=require"

# --- Redis ---
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"
REDIS_URL="redis://default:pass@xxx.upstash.io:6379"

# --- Search (Typesense) ---
TYPESENSE_HOST="xxx.a1.typesense.net"
TYPESENSE_PORT="443"
TYPESENSE_PROTOCOL="https"
TYPESENSE_API_KEY="your-api-key"

# --- Auth ---
NEXTAUTH_SECRET="your-64-char-random-secret"
NEXTAUTH_URL="https://alayainsider.com"

# --- Google OAuth ---
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"

# --- Email ---
RESEND_API_KEY="re_xxx"
EMAIL_FROM="alaya@alayainsider.com"

# --- Media ---
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="xxx"
CLOUDINARY_API_SECRET="xxx"

# --- AI Providers ---
OPENAI_API_KEY="sk-xxx"
# ANTHROPIC_API_KEY="sk-ant-xxx"

# --- AI Cost Controls ---
AI_MAX_COST_PER_TASK="0.50"
AI_MONTHLY_BUDGET="200"

# --- Monitoring ---
SENTRY_DSN="https://xxx@xxx.ingest.us.sentry.io/xxx"
SENTRY_AUTH_TOKEN="your-auth-token"

# --- App ---
NEXT_PUBLIC_SITE_URL="https://alayainsider.com"
NODE_ENV="production"
```

---

## Post-Setup Checklist

After filling in all secrets:

```bash
# 1. Copy env to the VPS
scp .env.production root@your-vps-ip:/root/

# 2. On VPS, deploy
bash scripts/deploy-to-hostinger.sh

# 3. Verify all services
bash scripts/verify-production-services.sh

# 4. Seed the database
bash scripts/setup-real-db-and-seed.sh

# 5. Run final audit
bash scripts/production-audit.sh
```

All services have built-in graceful degradation — if a service's API key is missing, the app continues to work with reduced functionality rather than crashing.
