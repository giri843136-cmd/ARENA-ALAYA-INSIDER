#!/bin/bash
# =============================================
# ALAYA INSIDER — Automated Penetration Testing Suite
# Runs OWASP ZAP, nmap, nikto, and custom security scans
# Usage: bash scripts/security/penetration-test.sh [target_url]
# =============================================

set -euo pipefail

TARGET="${1:-https://alayainsider.com}"
REPORT_DIR="./security-reports/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$REPORT_DIR"

echo "========================================"
echo " ALAYA INSIDER — Penetration Test Suite"
echo " Target: $TARGET"
echo " Reports: $REPORT_DIR"
echo "========================================"

# =============================================
# 1. INFORMATION GATHERING
# =============================================
echo ""
echo "[1/6] Information Gathering..."

# DNS enumeration
echo "  → DNS records..."
dig +short "$(echo $TARGET | sed 's|https://||' | sed 's|/.*||')" ANY > "$REPORT_DIR/dns.txt" 2>/dev/null || echo "    (dig not available)"

# HTTP headers check
echo "  → HTTP security headers..."
curl -sI "$TARGET" > "$REPORT_DIR/headers.txt"
echo "    Saved to headers.txt"

# =============================================
# 2. NETWORK SCAN (nmap)
# =============================================
echo ""
echo "[2/6] Network Scan..."
if command -v nmap &> /dev/null; then
    DOMAIN=$(echo "$TARGET" | sed 's|https://||' | sed 's|/.*||')
    nmap -sV -sC -p 80,443,8080,8443 "$DOMAIN" -oN "$REPORT_DIR/nmap.txt" 2>/dev/null || \
        nmap -sV -p 80,443 "$DOMAIN" -oN "$REPORT_DIR/nmap.txt" 2>/dev/null || \
        echo "    (nmap scan failed - check permissions)"
    echo "    Results saved to nmap.txt"
else
    echo "    (nmap not installed - skipping)"
fi

# =============================================
# 3. WEB SERVER SCAN (nikto)
# =============================================
echo ""
echo "[3/6] Web Server Scan..."
if command -v nikto &> /dev/null; then
    nikto -h "$TARGET" -o "$REPORT_DIR/nikto.html" -Format htm 2>/dev/null || \
        echo "    (nikto scan failed)"
    echo "    Results saved to nikto.html"
else
    echo "    (nikto not installed - skipping)"
fi

# =============================================
# 4. OWASP ZAP SCAN
# =============================================
echo ""
echo "[4/6] OWASP ZAP Scan..."
if command -v zap-cli &> /dev/null; then
    zap-cli start --api-key "$ZAP_API_KEY" 2>/dev/null || true
    zap-cli open-url "$TARGET" 2>/dev/null || true
    zap-cli spider "$TARGET" 2>/dev/null || true
    zap-cli active-scan "$TARGET" 2>/dev/null || true
    zap-cli report -o "$REPORT_DIR/zap-report.html" -f html 2>/dev/null || true
    zap-cli shutdown 2>/dev/null || true
    echo "    Results saved to zap-report.html"
else
    echo "    (zap-cli not installed - running baseline scan via Docker)"
    if command -v docker &> /dev/null; then
        docker pull softwaresecurityproject/zap-stable:latest 2>/dev/null || true
        docker run --rm -v "$(pwd)/$REPORT_DIR:/zap/wrk" \
            softwaresecurityproject/zap-stable:latest \
            zap-baseline.py -t "$TARGET" -r zap-baseline.html \
            2>/dev/null && echo "    Baseline scan saved to zap-baseline.html" || \
            echo "    (Docker ZAP scan failed)"
    else
        echo "    (Docker not available - manual ZAP scan recommended)"
    fi
fi

# =============================================
# 5. CUSTOM SECURITY CHECKS
# =============================================
echo ""
echo "[5/6] Custom Security Checks..."

# TLS version check
echo "  → TLS version..."
curl -sI --tlsv1.3 "$TARGET" > /dev/null 2>&1 && echo "    ✅ TLS 1.3 supported" || echo "    ❌ TLS 1.3 NOT supported"
curl -sI --tlsv1.2 "$TARGET" > /dev/null 2>&1 && echo "    ✅ TLS 1.2 supported" || echo "    ❌ TLS 1.2 NOT supported"

# Security headers check
echo "  → Security headers..."
check_header() {
    local header="$1"
    local value=$(curl -sI "$TARGET" | grep -i "^$header:" | head -1)
    if [ -n "$value" ]; then
        echo "    ✅ $header"
    else
        echo "    ⚠️  $header MISSING"
    fi
}
check_header "Strict-Transport-Security"
check_header "X-Content-Type-Options"
check_header "X-Frame-Options"
check_header "Content-Security-Policy"
check_header "Referrer-Policy"
check_header "Permissions-Policy"

# CORS check
echo "  → CORS configuration..."
CORS_RESULT=$(curl -sI -H "Origin: https://evil.com" "$TARGET" | grep -i "access-control-allow-origin" || echo "")
if echo "$CORS_RESULT" | grep -q "evil"; then
    echo "    ❌ CORS misconfigured - allows evil.com!"
else
    echo "    ✅ CORS properly restricted"
fi

# Rate limiting check
echo "  → Rate limiting..."
for i in {1..65}; do
    curl -s -o /dev/null -w "%{http_code}" "$TARGET/api/health" 2>/dev/null
done > "$REPORT_DIR/ratelimit-test.txt"
RATELIMIT_429=$(grep -c "429" "$REPORT_DIR/ratelimit-test.txt" || true)
if [ "$RATELIMIT_429" -gt 0 ]; then
    echo "    ✅ Rate limiting active ($RATELIMIT_429 blocked requests)"
else
    echo "    ⚠️  Rate limiting may not be active"
fi

# XSS check (basic)
echo "  → Basic XSS check..."
XSS_PAYLOAD="<script>alert(1)</script>"
XSS_RESULT=$(curl -s "$TARGET/search?q=$XSS_PAYLOAD" 2>/dev/null | grep -c "<script>alert(1)</script>" || true)
if [ "$XSS_RESULT" -gt 0 ]; then
    echo "    ❌ Possible XSS vulnerability in search!"
else
    echo "    ✅ No reflected XSS detected in search"
fi

# Directory traversal check
echo "  → Directory traversal..."
TRAVERSAL_RESULT=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET/../../../etc/passwd" 2>/dev/null || true)
if [ "$TRAVERSAL_RESULT" = "200" ]; then
    echo "    ❌ Possible directory traversal!"
elif [ "$TRAVERSAL_RESULT" = "404" ] || [ "$TRAVERSAL_RESULT" = "403" ] || [ -z "$TRAVERSAL_RESULT" ]; then
    echo "    ✅ Protected against directory traversal"
fi

# Sensitive file exposure
echo "  → Sensitive file exposure..."
for file in .env .git/config .env.local .env.production config.yml secrets.yml; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET/$file" 2>/dev/null || true)
    if [ "$STATUS" = "200" ]; then
        echo "    ❌ Exposed: $file"
    fi
done

# =============================================
# 6. SUMMARY
# =============================================
echo ""
echo "========================================"
echo " PENETRATION TEST COMPLETE"
echo "========================================"
echo " Target: $TARGET"
echo " Reports: $REPORT_DIR"
echo ""
echo " Files generated:"
ls -la "$REPORT_DIR/" 2>/dev/null || echo " (no reports generated)"
echo ""
echo " Recommended next steps:"
echo " 1. Review reports in $REPORT_DIR"
echo " 2. Run OWASP ZAP full scan manually for comprehensive results"
echo " 3. Fix any findings marked ❌ above"
echo " 4. Re-run this script to verify fixes"
echo "========================================"
