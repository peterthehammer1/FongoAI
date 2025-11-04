#!/bin/bash
# Test dashboard routes with proper debugging

cd /var/www/nucleusai

echo "=== Route mounting check ==="
grep -A 2 "app.use('/dashboard/api'" index.js

echo ""
echo "=== Routes in dashboard.js ==="
grep "router.get" routes/dashboard.js | head -3

echo ""
echo "=== Testing with authentication cookie ==="
# First login to get a session cookie
SESSION=$(curl -s -c /tmp/cookies.txt -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pete@nucleus.com","password":"NucleusAI2025!Secure"}' \
  | grep -o '"success":true' && echo "Login successful")

if [ -n "$SESSION" ]; then
    echo "Testing /dashboard/api/calls with session..."
    curl -s -b /tmp/cookies.txt http://localhost:3000/dashboard/api/calls?limit=5 | head -20
else
    echo "Login failed - testing without auth (should redirect)..."
    curl -s -I http://localhost:3000/dashboard/api/calls 2>&1 | grep -E "HTTP|Location"
fi

echo ""
echo "=== Checking route registration ==="
pm2 logs nucleusai --lines 10 --nostream | grep -i "route\|dashboard\|error" | tail -5

