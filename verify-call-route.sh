#!/bin/bash
# Verify call route is working

cd /var/www/nucleusai

echo "=== Checking route definition ==="
grep -n "router.get('/call" routes/dashboard.js

echo ""
echo "=== Checking route mounting ==="
grep -n "app.use('/dashboard/api" index.js

echo ""
echo "=== Testing route directly ==="
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000/dashboard/api/call/call_a0c4cc5b6ee7442064d81ae2497

echo ""
echo "=== Checking PM2 logs for errors ==="
pm2 logs nucleusai --lines 5 --nostream | tail -5

