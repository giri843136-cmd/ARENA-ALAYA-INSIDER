#!/bin/bash
# =============================================
# ALAYA INSIDER — CDN + TLS + DNSSEC SETUP
# Hardens DNS, enables HTTPS-only, HSTS preload
# =============================================
set -euo pipefail

echo "=== ALAYA INSIDER — CDN + TLS + DNSSEC ==="
echo ""
echo "IMPORTANT: Run these steps in your DNS provider dashboard AND Cloudflare."
echo ""

echo "=== STEP 1: DNSSEC ==="
echo "1. Go to your domain registrar (Namecheap/GoDaddy/etc.)"
echo "2. Enable DNSSEC for alayainsider.com"
echo "3. Copy the DS record to your DNS provider"
echo ""
echo "  Verify: dig alayainsider.com DNSSEC +dnssec"
echo ""

echo "=== STEP 2: CLOUDFLARE SETUP ==="
echo "1. Add alayainsider.com to Cloudflare"
echo "2. Update nameservers to Cloudflare's"
echo "3. Enable:"
echo "   - SSL/TLS: Full (strict)"
echo "   - Always Use HTTPS: ON"
echo "   - HSTS: ON (max-age=63072000, includeSubDomains, preload)"
echo "   - Minimum TLS Version: 1.3"
echo "   - Certificate Transparency Monitoring: ON"
echo "4. Configure Authenticated Origin Pulls:"
echo "   - Generate TLS client certificate from Cloudflare"
echo "   - Install on VPS:"
echo ""

# Save the origin pull setup
cat > /tmp/cloudflare-origin-pull.sh << 'CFEOF'
#!/bin/bash
# Install Cloudflare origin CA certificate
curl -fsSL https://developers.cloudflare.com/ssl/static/authenticated_origin_pull_ca.pem \
  -o /etc/ssl/certs/cloudflare-origin-ca.pem

# Configure Nginx to verify Cloudflare TLS
cat > /etc/nginx/conf.d/cloudflare-origin-pull.conf << 'NGINX_CF'
ssl_client_certificate /etc/ssl/certs/cloudflare-origin-ca.pem;
ssl_verify_client on;
NGINX_CF

# Restart nginx
nginx -t && systemctl reload nginx
echo "Cloudflare Authenticated Origin Pulls configured."
CFEOF

chmod +x /tmp/cloudflare-origin-pull.sh
echo "  Script saved: /tmp/cloudflare-origin-pull.sh"
echo ""

echo "=== STEP 3: WAF RULES ==="
echo "Create these WAF rules in Cloudflare Dashboard:"
echo ""
echo "  Rule 1 - OWASP Core Rule Set:"
echo "    - Action: Block (score > 5)"
echo "    - Paranoia Level: 2"
echo ""
echo "  Rule 2 - Block Scrapers:"
echo "    - (http.user_agent contains 'python-requests') OR"
echo "    - (http.user_agent contains 'curl') OR"
echo "    - (http.user_agent contains 'wget')"
echo "    - Action: Block"
echo ""
echo "  Rule 3 - Rate Limit by IP:"
echo "    - /api/* -> 100 requests per minute"
echo "    - /auth/* -> 10 requests per minute"
echo "    - Action: Block for 1 hour"
echo ""
echo "  Rule 4 - Block Malicious Referrers:"
echo "    - http.referer contains known spam domains"
echo "    - Action: Block"
echo ""
echo "  Rule 5 - Bot Fight Mode:"
echo "    - Enabled for all /products/*, /deals/* paths"
echo ""

echo "=== STEP 4: HSTS PRELOAD ==="
echo "1. Verify your site returns HSTS header:"
echo "   curl -sI https://alayainsider.com | grep -i strict-transport"
echo ""
echo "2. Submit to https://hstspreload.org/"
echo "   - Only after HSTS has been active for > 48 hours"
echo ""

echo "=== STEP 5: TLS CERTIFICATE AUTOMATION ==="
echo "If NOT using Cloudflare (direct VPS with Let's Encrypt):"

cat > /etc/cron.weekly/ssl-renewal << 'SSL_CRON'
#!/bin/bash
certbot renew --quiet --post-hook "systemctl reload nginx"
echo "SSL certificates renewed at $(date)" >> /var/log/ssl-renewal.log
SSL_CRON
chmod +x /etc/cron.weekly/ssl-renewal

echo "  Weekly auto-renewal cron installed at /etc/cron.weekly/ssl-renewal"
echo "  Log: /var/log/ssl-renewal.log"
echo ""

echo "=== STEP 6: VERIFICATION ==="
cat > /tmp/check-security-headers.sh << 'CHECKEOF'
#!/bin/bash
echo "=== Security Headers Check ==="
echo "Target: $1"
echo ""

check_header() {
  local header=$1
  local expected=$2
  local result=$(curl -sI "https://$1" | grep -i "$header" | head -1)
  if [ -n "$result" ]; then
    echo "  ✅ $header: present"
  else
    echo "  ❌ $header: MISSING"
  fi
}

DOMAIN="${1:-alayainsider.com}"
check_header "$DOMAIN" "Strict-Transport-Security"
check_header "$DOMAIN" "Content-Security-Policy"
check_header "$DOMAIN" "X-Content-Type-Options"
check_header "$DOMAIN" "X-Frame-Options"
check_header "$DOMAIN" "Referrer-Policy"
check_header "$DOMAIN" "Permissions-Policy"

echo ""
echo "=== TLS Check ==="
echo | openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" -tls1_3 2>/dev/null | grep -E "Protocol|Cipher" || echo "TLS 1.3 not supported"
CHECKEOF

chmod +x /tmp/check-security-headers.sh
echo "  Check script: /tmp/check-security-headers.sh"
echo "  Run: bash /tmp/check-security-headers.sh alayainsider.com"
echo ""

echo "=== CDN + TLS SETUP GUIDE COMPLETE ==="
