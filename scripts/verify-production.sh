#!/bin/bash
# =============================================
# ALAYA INSIDER — Production Verification Script
# =============================================
# Comprehensive check: security headers, services,
# dependencies, backups, and compliance.
# =============================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://alayainsider.com}"
PASS=0
FAIL=0
WARN=0

check_pass() {
  echo -e "  ${GREEN}✓${NC} $1"
  PASS=$((PASS + 1))
}

check_fail() {
  echo -e "  ${RED}✗${NC} $1"
  FAIL=$((FAIL + 1))
}

check_warn() {
  echo -e "  ${YELLOW}⚠${NC} $1"
  WARN=$((WARN + 1))
}

echo ""
echo "============================================="
echo " ALAYA INSIDER — PRODUCTION VERIFICATION"
echo "============================================="
echo "  Site: $SITE_URL"
echo "  Date: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "============================================="
echo ""

# =============================================
# 1. SECURITY HEADERS
# =============================================
echo "━━━ 1. SECURITY HEADERS ━━━"

# Fetch headers from both direct and redirect-following modes
HEADERS_DIRECT=$(curl -sI --max-time 10 "$SITE_URL" 2>/dev/null || curl -sI --max-time 10 -k "$SITE_URL" 2>/dev/null)
HEADERS_FOLLOW=$(curl -sIL --max-time 10 "$SITE_URL" 2>/dev/null)

# Use direct headers first, fall back to follow
if [ -z "$HEADERS_DIRECT" ]; then
  HEADERS="$HEADERS_FOLLOW"
  echo -e "  ${CYAN}ℹ${NC} Direct HEAD failed, using redirect-follow mode"
else
  HEADERS="$HEADERS_DIRECT"
fi

# Check if the response has a server header indicating behind Cloudflare
if echo "$HEADERS" | grep -qi "cloudflare"; then
  echo -e "  ${CYAN}ℹ${NC} Site appears to be behind Cloudflare — some headers may be set by Cloudflare edge"
fi

# Check for Nginx server header
if echo "$HEADERS" | grep -qi "Server: nginx"; then
  echo -e "  ${CYAN}ℹ${NC} Server is Nginx — headers defined in nginx.conf"
fi

# Strict-Transport-Security
if echo "$HEADERS" | grep -qi "Strict-Transport-Security"; then
  check_pass "HSTS header present"
else
  check_warn "HSTS header not detected via curl. Check: (1) nginx.conf has 'add_header Strict-Transport-Security ... always;' (2) Cloudflare edge HSTS setting"
fi

# Content-Security-Policy
if echo "$HEADERS" | grep -qi "Content-Security-Policy"; then
  check_pass "CSP header present"
else
  check_fail "CSP header missing. Check nginx.conf (next.config.ts also sets this)"
fi

# X-Content-Type-Options
if echo "$HEADERS" | grep -qi "X-Content-Type-Options: nosniff"; then
  check_pass "X-Content-Type-Options: nosniff"
else
  check_fail "X-Content-Type-Options missing or incorrect"
fi

# X-Frame-Options
if echo "$HEADERS" | grep -qi "X-Frame-Options: DENY"; then
  check_pass "X-Frame-Options: DENY"
else
  check_fail "X-Frame-Options missing or incorrect"
fi

# Referrer-Policy
if echo "$HEADERS" | grep -qi "Referrer-Policy: strict-origin-when-cross-origin"; then
  check_pass "Referrer-Policy: strict-origin-when-cross-origin"
else
  check_warn "Referrer-Policy not detected. Check (1) nginx.conf (2) Cloudflare Transform Rules may override"
fi

# Permissions-Policy
if echo "$HEADERS" | grep -qi "Permissions-Policy"; then
  check_pass "Permissions-Policy header present"
else
  check_warn "Permissions-Policy not detected. Check (1) nginx.conf (2) Cloudflare Transform Rules"
fi

# Powered-By (should NOT be present — but Nginx and Cloudflare will have Server headers)
if echo "$HEADERS" | grep -qi "X-Powered-By"; then
  check_fail "Server leaks X-Powered-By header"
else
  check_pass "No X-Powered-By header"
fi

# Show the raw headers for debugging failed checks
if [ "$FAIL" -gt 0 ] || [ "$WARN" -gt 0 ]; then
  echo -e "  ${CYAN}ℹ${NC} Raw response headers for debugging:"
  echo "$HEADERS" | while IFS= read -r line; do
    echo "    $line"
  done | head -25
fi

echo ""

# =============================================
# 2. TLS/SSL CHECK
# =============================================
echo "━━━ 2. TLS/SSL ━━━"

TLS_CHECK=$(curl -svI "https://$SITE_URL" 2>&1 | grep -i "SSL connection\|TLS")
if echo "$TLS_CHECK" | grep -qi "TLS"; then
  check_pass "TLS connection established ($(echo "$TLS_CHECK" | head -1 | tr -d ','))"
else
  check_warn "Could not verify TLS version (run: openssl s_client -connect $SITE_URL:443)"
fi

# Check for HSTS preload
HSTS_HEADER=$(echo "$HEADERS" | grep -i "Strict-Transport-Security" | head -1)
if echo "$HSTS_HEADER" | grep -qi "preload"; then
  check_pass "HSTS preload enabled"
else
  check_warn "HSTS preload not enabled"
fi

echo ""

# =============================================
# 3. APPLICATION HEALTH
# =============================================
echo "━━━ 3. APPLICATION HEALTH ━━━"

# Main health endpoint
HEALTH=$(curl -s "$SITE_URL/api/health" 2>/dev/null || echo '{"status":"unreachable"}')
if echo "$HEALTH" | grep -q '"status":"ok"\|"status":"healthy"'; then
  check_pass "Health endpoint: healthy"
else
  if echo "$HEALTH" | grep -q "unreachable"; then
    check_warn "Health endpoint unreachable (may be behind auth)"
  else
    check_warn "Health endpoint status: $(echo "$HEALTH" | grep -o '"status":"[^"]*"' | head -1)"
  fi
fi

# OPS health endpoint
OPS_HEALTH=$(curl -s "$SITE_URL/api/ops/health" 2>/dev/null || echo '{"status":"unreachable"}')
if echo "$OPS_HEALTH" | grep -q '"database":"ok"\|"healthy"'; then
  check_pass "OPS health endpoint: services healthy"
else
  check_warn "OPS health endpoint degraded or unreachable"
  if echo "$OPS_HEALTH" | grep -q "database"; then
    echo "       DB: $(echo "$OPS_HEALTH" | grep -o '"database":"[^"]*"' | head -1)"
    echo "       Redis: $(echo "$OPS_HEALTH" | grep -o '"redis":"[^"]*"' | head -1)"
    echo "       Typesense: $(echo "$OPS_HEALTH" | grep -o '"typesense":"[^"]*"' | head -1)"
  fi
fi

# Homepage loads
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL" 2>/dev/null || echo "000")
if [ "$STATUS" = "200" ] || [ "$STATUS" = "301" ] || [ "$STATUS" = "302" ]; then
  check_pass "Homepage loads (HTTP $STATUS)"
else
  check_fail "Homepage HTTP status: $STATUS"
fi

# Check for 404
STATUS404=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/nonexistent-page-12345" 2>/dev/null || echo "000")
if [ "$STATUS404" = "404" ]; then
  check_pass "404 page returns 404 correctly"
else
  check_warn "Non-existent page returned HTTP $STATUS404 (expected 404)"
fi

echo ""

# =============================================
# 4. SECURITY PATHS
# =============================================
echo "━━━ 4. SECURITY ENDPOINTS ━━━"

# CSP violation endpoint
CSP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$SITE_URL/api/csp-violation" \
  -H "Content-Type: application/json" \
  -d '{"csp-report":{"blocked-uri":"test","violated-directive":"test","original-policy":"test"}}' 2>/dev/null || echo "000")
if [ "$CSP_STATUS" = "200" ]; then
  check_pass "CSP violation reporting endpoint active"
else
  check_warn "CSP violation endpoint HTTP $CSP_STATUS"
fi

# Check security.txt (if deployed to /.well-known/)
WELL_KNOWN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/.well-known/security.txt" 2>/dev/null || echo "000")
if [ "$WELL_KNOWN_STATUS" = "200" ]; then
  check_pass "security.txt published"
else
  check_warn "security.txt not found at /.well-known/security.txt (HTTP $WELL_KNOWN_STATUS)"
  # Check at root
  ROOT_SEC_TXT=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/security.txt" 2>/dev/null || echo "000")
  if [ "$ROOT_SEC_TXT" = "200" ]; then
    check_pass "security.txt found at /security.txt"
  fi
fi

# robots.txt
ROBOTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/robots.txt" 2>/dev/null || echo "000")
if [ "$ROBOTS_STATUS" = "200" ]; then
  check_pass "robots.txt accessible"
else
  check_warn "robots.txt HTTP $ROBOTS_STATUS"
fi

echo ""

# =============================================
# 5. INFRASTRUCTURE CHECK (Server-side)
# =============================================
echo "━━━ 5. INFRASTRUCTURE ━━━"

# Check if required tools are available
for tool in node npm nginx docker docker-compose pm2 redis-cli; do
  if command -v "$tool" &> /dev/null; then
    check_pass "$tool available"
  else
    check_warn "$tool not found on this system"
  fi
done 2>/dev/null || true

# Check PM2 processes
if command -v pm2 &> /dev/null; then
  PM2_STATUS=$(pm2 list 2>/dev/null | grep -c "online" || true)
  if [ "$PM2_STATUS" -gt 0 ]; then
    check_pass "PM2 processes running ($PM2_STATUS online)"
  else
    check_warn "No PM2 processes online"
  fi
fi

# Docker check
if command -v docker &> /dev/null; then
  DOCKER_STATUS=$(docker ps -q 2>/dev/null | wc -l || true)
  if [ "$DOCKER_STATUS" -gt 0 ]; then
    check_pass "Docker containers running ($DOCKER_STATUS)"
  else
    check_warn "No Docker containers running"
  fi
fi

echo ""

# =============================================
# 6. COMPLIANCE CHECK
# =============================================
echo "━━━ 6. COMPLIANCE ━━━"

# Check cookie consent
COOKIE_CHECK=$(curl -s "$SITE_URL" 2>/dev/null | grep -c "cookie\|CookieConsent\|alaya_cookie_consent" || true)
if [ "$COOKIE_CHECK" -gt 0 ]; then
  check_pass "Cookie consent banner present"
else
  check_warn "Cookie consent banner not detected in homepage HTML"
fi

# Check privacy policy accessible
PRIVACY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/privacy" 2>/dev/null || echo "000")
if [ "$PRIVACY_STATUS" = "200" ]; then
  check_pass "Privacy policy accessible (/privacy)"
else
  check_warn "Privacy policy HTTP $PRIVACY_STATUS"
fi

# Check terms accessible
TERMS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/terms" 2>/dev/null || echo "000")
if [ "$TERMS_STATUS" = "200" ]; then
  check_pass "Terms of service accessible (/terms)"
else
  check_warn "Terms of service HTTP $TERMS_STATUS"
fi

echo ""

# =============================================
# 7. DATABASE CHECK
# =============================================
echo "━━━ 7. DATABASE ━━━"

if command -v npx &> /dev/null && [ -f "prisma/schema.prisma" ]; then
  PRISMA_STATUS=$(npx prisma db push --dry-exit-code --accept-data-loss 2>&1 || true)
  if echo "$PRISMA_STATUS" | grep -q "schema is up-to-date\|No changes"; then
    check_pass "Prisma schema matches database (up-to-date)"
  else
    if echo "$PRISMA_STATUS" | grep -q "Drift\|changes\|migrations"; then
      check_warn "Prisma schema drift detected — run: npx prisma db push"
    else
      check_warn "Could not verify Prisma schema (DB may not be connected)"
    fi
  fi
fi

echo ""

# =============================================
# SUMMARY
# =============================================
TOTAL=$((PASS + FAIL + WARN))
echo "============================================="
echo -e " VERIFICATION COMPLETE"
echo "============================================="
echo -e "  ${GREEN}Passed: $PASS${NC}"
echo -e "  ${RED}Failed: $FAIL${NC}"
echo -e "  ${YELLOW}Warnings: $WARN${NC}"
echo "  Total checks: $TOTAL"
echo "============================================="

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo -e "${RED}❌ Some checks failed. Review and fix before marking as production-ready.${NC}"
  exit 1
elif [ "$WARN" -gt 0 ]; then
  echo ""
  echo -e "${YELLOW}⚠️  All critical checks passed with warnings.${NC}"
  exit 0
else
  echo ""
  echo -e "${GREEN}✅ All checks passed. Production-ready.${NC}"
  exit 0
fi
