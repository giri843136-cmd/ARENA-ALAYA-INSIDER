#!/bin/bash
# =============================================
# ALAYA INSIDER — PENETRATION TEST SIMULATOR
# Tests: SQLi, XSS, CSRF, SSRF, LFI/RFI, IDOR, JWT, CRLF, Open Redirect
# Run against STAGING environment only
# =============================================
set -euo pipefail

TARGET="${1:-https://staging.alayainsider.com}"
echo "=== ALAYA INSIDER — Pen Test Simulator ==="
echo "Target: $TARGET"
echo ""

PASS=0
FAIL=0
WARN=0

check() {
  local test_name="$1"
  local condition="$2"
  if [ "$condition" = "true" ]; then
    echo "  ✅ PASS: $test_name"
    PASS=$((PASS + 1))
  else
    echo "  ❌ FAIL: $test_name"
    FAIL=$((FAIL + 1))
  fi
}

warn() {
  echo "  ⚠️  WARN: $1"
  WARN=$((WARN + 1))
}

echo "=========================================="
echo " TEST 1: SQL INJECTION"
echo "=========================================="

# Test basic SQLi in search
SQLI_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  "$TARGET/search?q='%20OR%201=1--" \
  2>/dev/null)
check "SQLi in search (expected 200 — parameterized query)" \
  "$SQLI_RESPONSE" = "200" || "$SQLI_RESPONSE" = "400"

# SQLi in product page
SQLI_PROD=$(curl -s -o /dev/null -w "%{http_code}" \
  "$TARGET/products/1'%20OR%20'1'='1" \
  2>/dev/null)
check "SQLi in product slug (should not crash)" \
  "$SQLI_PROD" != "500"

echo ""
echo "=========================================="
echo " TEST 2: CROSS-SITE SCRIPTING (XSS)"
echo "=========================================="

# Reflected XSS in search
XSS_RESP=$(curl -s "$TARGET/search?q=<script>alert(1)</script>" \
  2>/dev/null | grep -c "<script>alert(1)</script>" || true)
check "Reflected XSS in search (should be 0 instances)" \
  "[ $XSS_RESP -eq 0 ]"

# Stored XSS attempt via comment
XSS_STORED=$(curl -s -X POST "$TARGET/api/v1/comments" \
  -H "Content-Type: application/json" \
  -d '{"articleId":"test","content":"<script>document.cookie</script>","guestName":"<img onerror=alert(1)>"}') || true
check "Stored XSS in comments should be blocked" \
  "$(echo "$XSS_STORED" | grep -c 'success.*false' || echo '0')" = "0" || warn "Stored XSS test needs manual review"

echo ""
echo "=========================================="
echo " TEST 3: CSRF PROTECTION"
echo "=========================================="

# Attempt state-changing request without CSRF token
CSRF_TEST=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$TARGET/api/v1/admin/security/change-password" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"test","newPassword":"newTest123!"}' \
  2>/dev/null)
check "CSRF protection on POST (expected 403)" \
  "[ $CSRF_TEST -eq 403 ]"

echo ""
echo "=========================================="
echo " TEST 4: AUTH & JWT"
echo "=========================================="

# Access admin page without auth
UNAUTH_ADMIN=$(curl -s -o /dev/null -w "%{http_code}" \
  "$TARGET/admin" 2>/dev/null)
check "Unauthenticated /admin redirect (expected 302)" \
  "[ $UNAUTH_ADMIN -eq 302 ]" || warn "Got $UNAUTH_ADMIN — check proxy"

# Access admin API without auth
UNAUTH_API=$(curl -s -o /dev/null -w "%{http_code}" \
  "$TARGET/api/v1/admin/stats" 2>/dev/null)
check "Unauthenticated admin API (expected 401/403)" \
  "[ $UNAUTH_API -eq 401 ]" || "[ $UNAUTH_API -eq 403 ]"

# Check JWT secret strength
JWT_HEADER=$(curl -sI "$TARGET/" | grep -i "^Set-Cookie.*next-auth" || true)
check "Secure session cookie (HttpOnly)" \
  "$(echo "$JWT_HEADER" | grep -ci 'httponly' || echo '0')" -gt 0

echo ""
echo "=========================================="
echo " TEST 5: SSRF / LFI / RFI"
echo "=========================================="

# SSRF via image URL
SSRF_TEST=$(curl -s -X POST "$TARGET/api/v1/admin/media/upload" \
  -H "Content-Type: application/json" \
  -d '{"url":"http://169.254.169.254/latest/meta-data/"}' \
  2>/dev/null)
check "SSRF via metadata URL should be blocked" \
  "$(echo "$SSRF_TEST" | grep -c 'success.*false' || echo '0')" = "0" || warn "SSRF test — verify manually"

echo ""
echo "=========================================="
echo " TEST 6: IDOR (Insecure Direct Object Reference)"
echo "=========================================="

# Try to access another user's data without auth
IDOR_TEST=$(curl -s -o /dev/null -w "%{http_code}" \
  "$TARGET/api/v1/user/favorites" 2>/dev/null)
check "IDOR on /api/v1/user/* without auth (expected 401)" \
  "[ $IDOR_TEST -eq 401 ]"

echo ""
echo "=========================================="
echo " TEST 7: SECURITY HEADERS"
echo "=========================================="

HEADERS=$(curl -sI "$TARGET/" 2>/dev/null)

check "X-Content-Type-Options: nosniff" \
  "$(echo "$HEADERS" | grep -ci 'x-content-type-options: nosniff')" -gt 0

check "X-Frame-Options: DENY" \
  "$(echo "$HEADERS" | grep -ci 'x-frame-options: deny')" -gt 0

check "Strict-Transport-Security" \
  "$(echo "$HEADERS" | grep -ci 'strict-transport-security')" -gt 0

check "Content-Security-Policy" \
  "$(echo "$HEADERS" | grep -ci 'content-security-policy')" -gt 0

check "Referrer-Policy" \
  "$(echo "$HEADERS" | grep -ci 'referrer-policy')" -gt 0

check "Permissions-Policy" \
  "$(echo "$HEADERS" | grep -ci 'permissions-policy')" -gt 0

echo ""
echo "=========================================="
echo " TEST 8: OPEN REDIRECT"
echo "=========================================="

REDIRECT_TEST=$(curl -s -o /dev/null -w "%{http_code}" \
  "$TARGET?redirect=https://evil.com" 2>/dev/null)
check "Open redirect should not occur" \
  "$REDIRECT_TEST" != "302" || warn "Check redirect handler"

echo ""
echo "=========================================="
echo " TEST 9: RATE LIMITING"
echo "=========================================="

# Rapid requests to auth endpoint
RATE_HIT=0
for i in $(seq 1 20); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    "$TARGET/api/auth/session" 2>/dev/null)
  if [ "$CODE" -eq 429 ]; then
    RATE_HIT=1
    break
  fi
done

check "Rate limiting returns 429 after burst" \
  "[ $RATE_HIT -eq 1 ]"

echo ""
echo "=========================================="
echo " TEST 10: TLS/SSL CONFIGURATION"
echo "=========================================="

# Check TLS 1.3 support
TLS13=$(echo | openssl s_client -connect "${TARGET#https://}:443" \
  -tls1_3 2>/dev/null | grep -c "Protocol.*TLSv1.3" || true)
check "TLS 1.3 supported" "[ $TLS13 -gt 0 ]"

echo ""
echo "=========================================="
echo " RESULTS"
echo "=========================================="
echo "  ✅ Passed: $PASS"
echo "  ❌ Failed: $FAIL"
echo "  ⚠️  Warnings: $WARN"
echo ""
if [ "$FAIL" -gt 0 ]; then
  echo "  🔴 Some tests failed — review above"
  exit 1
else
  echo "  🟢 All critical tests passed"
fi
echo "=========================================="
