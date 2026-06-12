#!/bin/bash
# Final production live verification (run on VPS after full deploy + real secrets + DNS)

echo "🌐 ALAYA INSIDER FINAL PRODUCTION VERIFICATION"
echo "=============================================="
echo "Target domain: https://alayainsider.com"
echo ""

# 1. Public site
echo "1. Public site (https://alayainsider.com):"
curl -sI https://alayainsider.com | head -5

# 2. Admin
echo ""
echo "2. Admin (https://alayainsider.com/admin):"
curl -sI https://alayainsider.com/admin | head -3

# 3. Health
echo ""
echo "3. Health endpoint:"
curl -s https://alayainsider.com/api/ops/health | head -c 200

# 4. Queues
echo ""
echo "4. Queues status:"
curl -s https://alayainsider.com/api/ops/queues | head -c 200

echo ""
echo "5. Google OAuth redirect (should 302 to Google):"
curl -sI "https://alayainsider.com/api/auth/signin/google" | head -3

echo ""
echo "✅ If all above return 200/healthy and no errors, site is fully operational."
echo "Login with Google OAuth at /admin to test Product Studio, AI, etc."
