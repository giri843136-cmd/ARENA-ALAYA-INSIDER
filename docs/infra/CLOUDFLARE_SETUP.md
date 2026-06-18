# ALAYA INSIDER — Cloudflare WAF & DDoS Protection Setup

## Overview

This guide configures Cloudflare as the CDN/WAF layer for ALAYA INSIDER. Following these steps ensures protection at the level of Amazon, Stripe, and Apple — including Web Application Firewall (OWASP Core Rule Set), DDoS mitigation, bot management, rate limiting, and origin IP protection.

## Prerequisites

- Cloudflare account (Free tier or higher; Pro+ recommended for WAF)
- Domain: alayainsider.com (and www.alayainsider.com)
- DNS pointed to Cloudflare nameservers

---

## 1. Initial DNS Setup

### 1.1 Add Domain to Cloudflare

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **Add a Site** → Enter `alayainsider.com`
3. Choose plan (Pro recommended for WAF + rate limiting)
4. Cloudflare scans existing DNS records
5. Replace your domain registrar's nameservers with Cloudflare's

### 1.2 DNS Records

| Type  | Name                    | Content                  | Proxy Status |
|-------|-------------------------|--------------------------|--------------|
| A     | @                       | <VPS_IP_ADDRESS>         | Proxied (☁️) |
| A     | www                     | <VPS_IP_ADDRESS>         | Proxied (☁️) |
| CNAME | *                        | alayainsider.com         | Proxied (☁️) |
| TXT   | @                       | v=spf1 ...               | DNS Only     |
| CNAME | _domainconnect           | ...                      | DNS Only     |

**Important:** All web traffic records MUST be proxied (orange cloud) for WAF/DDoS protection.

---

## 2. SSL/TLS Configuration

### 2.1 Overview Tab
- **SSL/TLS encryption mode:** Full (strict)
- **Minimum TLS Version:** 1.3
- **Opportunistic Encryption:** On
- **TLS 1.3 (edge):** Enabled
- **Automatic HTTPS Rewrites:** On
- **Certificate Transparency Monitoring:** On

### 2.2 Edge Certificates
- Enable **Always Use HTTPS**
- Enable **HTTP Strict Transport Security (HSTS)**
  - Max Age: 12 months (31536000)
  - Include Subdomains: Enabled
  - Preload: Enabled
- Enable **Authenticated Origin Pulls**
  - Provides Cloudflare's client certificate to verify at origin
  - Configure Nginx to only accept Cloudflare-authenticated connections

---

## 3. Web Application Firewall (WAF)

### 3.1 WAF Custom Rules

Navigate to **Security → WAF → Custom Rules**.

#### Rule 1: Block Known Bad Bots
```
Field: (http.user_agent contains "curl" or http.user_agent contains "wget" or http.user_agent contains "python-requests")
AND IP Source Address not in { <YOUR_ADMIN_VPN_IP> }
→ Block
```

#### Rule 2: Block TOR Exit Nodes (Admin)
```
Field: (cf.client.bot)
AND URI Path contains "/admin"
→ Block
```

#### Rule 3: Rate Limit Admin Access
```
Field: URI Path contains "/admin"
And: IP Source Address
→ Rate Limit: 20 requests per minute
→ Block for 10 minutes
```

#### Rule 4: Rate Limit Public API
```
Field: URI Path contains "/api/"
And: IP Source Address
→ Rate Limit: 100 requests per minute
→ Block for 5 minutes
```

#### Rule 5: Challenge Auth Endpoints
```
Field: URI Path contains "/api/auth/" or URI Path contains "/auth/"
And: IP Source Address
→ Rate Limit: 10 requests per 15 minutes
→ Challenge (JS challenge) for 10 minutes
```

### 3.2 OWASP Core Rule Set (CRS)

Navigate to **Security → WAF → Managed Rules**.

Enable **Cloudflare OWASP Core Ruleset** with:
- **Paranoia Level:** 3 (enterprise; start at 2, monitor for 1 week, then escalate)
- **Anomaly Score Threshold:** Critical (5) and Warning (40)
- **Action:** Block for scores ≥ 5

**Additional Managed Rulesets to Enable:**
- **Cloudflare Managed Ruleset:** All rules ON, set to Block
- **Cloudflare Admin Protection:** ON
- **Cloudflare DDoS Rules:** ON (use default)
- **Cloudflare API Shield:** ON (monitor mode, then block)

### 3.3 WAF Skip Rules (for trusted origins)

Create skip rules for:
- Google Analytics (measurement.google.com)
- Sentry (o*.ingest.sentry.io)
- Resend (api.resend.com)
- Any monitoring services (UptimeRobot, Pingdom)

---

## 4. DDoS Protection

### 4.1 Network-layer DDoS
Cloudflare's Network-layer DDoS protection is always enabled for proxied traffic.

### 4.2 HTTP DDoS
Navigate to **Security → DDoS**:
- **HTTP DDoS Managed Ruleset:** ON (default)
- **Sensitivity Level:** Medium (Low if experiencing false positives)
- **Action:** Managed (Cloudflare auto-selects based on attack type)

### 4.3 Advanced DDoS Rules (Pro+)
Create custom rules:
```
Rule: (http.request.rate > 3000 requests per 5 seconds per IP)
→ Block for 1 hour
```

```
Rule: (http.request.rate > 500 requests per second per URI path)
→ Block for 30 minutes
```

---

## 5. Bot Management

### 5.1 Bot Fight Mode (Free/Pro)
Navigate to **Security → Bots**.
- **Bot Fight Mode:** ON
  - Challenges likely automated visitors
  - Allows known good bots (Google, Bing, etc.)
  - Blocks known bad bots

### 5.2 Super Bot Fight Mode (Business)
If on Business plan:
- **Definitely Automated:** Block
- **Verified Bots:** Allow
- **Static Resource Protection:** ON
- **Anomaly Detection:** ON

### 5.3 Custom Bot Rules (Enterprise)
For even stricter control:
```
Rule: (cf.client.bot_score < 30)
AND URI Path contains "/checkout" or URI Path contains "/login"
→ JS Challenge
```

---

## 6. Origin Server Security

### 6.1 Cloudflare IP Whitelist

Restrict your VPS to ONLY accept traffic from Cloudflare IPs.

```bash
# Download Cloudflare IP ranges
wget -O /tmp/cf-ipv4.txt https://www.cloudflare.com/ips-v4
wget -O /tmp/cf-ipv6.txt https://www.cloudflare.com/ips-v6

# Create UFW rules
for ip in $(cat /tmp/cf-ipv4.txt); do
  sudo ufw allow from "$ip" to any port 80
  sudo ufw allow from "$ip" to any port 443
done

for ip in $(cat /tmp/cf-ipv6.txt); do
  sudo ufw allow from "$ip" to any port 80
  sudo ufw allow from "$ip" to any port 443
done

# Also allow SSH from your management IP only
sudo ufw allow from <YOUR_HOME_IP> to any port <SSH_PORT>
sudo ufw deny 22  # Close default SSH
sudo ufw enable
```

### 6.2 Nginx Configuration

Update `/etc/nginx/nginx.conf` to use Cloudflare's real IP:

```nginx
# In http block:
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 131.0.72.0/22;

# IPv6 ranges
set_real_ip_from 2400:cb00::/32;
set_real_ip_from 2606:4700::/32;
set_real_ip_from 2803:f800::/32;
set_real_ip_from 2405:b500::/32;
set_real_ip_from 2405:8100::/32;
set_real_ip_from 2a06:98c0::/29;
set_real_ip_from 2c0f:f248::/32;

real_ip_header CF-Connecting-IP;
real_ip_recursive on;
```

### 6.3 Authenticated Origin Pulls (TLS Client Certificate)

1. In Cloudflare Dashboard → **SSL/TLS → Origin Server**
2. Enable **Authenticated Origin Pulls**
3. Download Cloudflare's CA certificate
4. Configure Nginx:

```nginx
server {
    listen 443 ssl;
    
    ssl_client_certificate /etc/nginx/cloudflare.crt;
    ssl_verify_client on;
    
    # Optional: Allow only Cloudflare connections
    if ($ssl_client_verify != "SUCCESS") {
        return 403;
    }
}
```

---

## 7. Rate Limiting (Cloudflare Edge)

Navigate to **Security → WAF → Rate Limiting Rules**.

### Rule: Auth Endpoints
```
If: URI Path contains "/api/auth/"
Rate: 5 requests per 15 minutes per IP
Action: Block for 1 hour
Response: 429 Too Many Requests
```

### Rule: Newsletter Signup
```
If: URI Path contains "/api/v1/newsletter/"
Rate: 5 requests per hour per IP
Action: Block for 24 hours
```

### Rule: Search API
```
If: URI Path contains "/api/search"
Rate: 30 requests per minute per IP
Action: JS Challenge
```

### Rule: All Other API
```
If: URI Path contains "/api/"
Rate: 100 requests per minute per IP
Action: Block for 10 minutes
```

### Rule: All Other Traffic
```
If: True
Rate: 500 requests per 5 minutes per IP
Action: JS Challenge
```

---

## 8. Security Headers (Edge)

Cloudflare can add security headers at the edge via Transform Rules:

Navigate to **Rules → Transform Rules → Modify Response Headers**.

### Rule: Add Security Headers
```
If: True
→ Set static headers:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  - Cross-Origin-Embedder-Policy: require-corp
  - Cross-Origin-Opener-Policy: same-origin
  - Cross-Origin-Resource-Policy: same-origin
```

---

## 9. Performance Optimization

### 9.1 Argo Smart Routing (Pro+)
- Navigate to **Traffic → Argo**
- Enable **Argo Smart Routing**
- Routes traffic through the fastest available path

### 9.2 Auto Minify
- Navigate to **Speed → Optimization**
- Enable: Auto Minify (JavaScript, CSS, HTML)
- Enable: **Brotli** compression
- Enable: **Early Hints**

### 9.3 Cache Configuration
- Navigate to **Caching → Configuration**
- **Cache Level:** Standard
- **Browser Cache TTL:** 4 hours
- **Edge Cache TTL:** Respect Origin Headers

### 9.4 Page Rules (For static content)
```
Pattern: alayainsider.com/_next/static/*
Setting: Cache Level: Cache Everything
Setting: Edge Cache TTL: 30 days
Setting: Browser Cache TTL: 7 days
```

---

## 10. Monitoring & Alerting

### 10.1 Security Events
- Navigate to **Security → Events**
- Review blocked requests, rate limits, and WAF events daily
- Export logs to Logpush for long-term retention

### 10.2 Analytics
- **Security Center Overview:** Daily review
- **Web Analytics:** Traffic patterns
- **Bot Analytics:** Bot traffic breakdown

### 10.3 Alerts
Navigate to **Notifications → Alerts** and configure:
- **Security Events Alert:** High-severity WAF blocks
- **DDoS Alert:** Attack detected
- **Origin Error Alert:** 5xx errors from origin
- **Usage Alert:** Traffic spikes

---

## 11. Verification Checklist

- [ ] DNS proxied (orange cloud) for all web records
- [ ] SSL/TLS set to Full (strict) with TLS 1.3 enforced
- [ ] HSTS enabled with preload
- [ ] Authenticated Origin Pulls enabled
- [ ] OWASP CRS enabled at Paranoia Level 3
- [ ] Rate limiting rules active for auth, API, and search
- [ ] DDoS protection enabled
- [ ] Bot Fight Mode enabled
- [ ] Origin server UFW configured to accept only Cloudflare IPs
- [ ] Nginx real_ip configuration updated
- [ ] Security headers configured at edge (including HSTS, Referrer-Policy, Permissions-Policy)
- [ ] Cache rules optimized for static assets
- [ ] Notifications configured for security events
- [ ] Visit https://www.ssllabs.com/ssltest/ → Grade A+
- [ ] Visit https://securityheaders.com → Grade A+
- [ ] Run: `curl -sI https://alayainsider.com | grep -i "server\|x-powered-by"` — should not leak server info

---

## 12. Emergency Procedures

### Block All Traffic (DDoS Mitigation)
```bash
# Cloudflare API: Under Attack Mode
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/security_level" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"value": "under_attack"}'
```

### Bypass Cache (Origin Update)
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything": true}'
```

---

## Appendix: Required Environment Variables

Add these to your `.env`:

```bash
# Cloudflare
CLOUDFLARE_API_TOKEN="your_cloudflare_api_token"
CLOUDFLARE_ZONE_ID="your_zone_id"
CLOUDFLARE_ACCOUNT_ID="your_account_id"
```
