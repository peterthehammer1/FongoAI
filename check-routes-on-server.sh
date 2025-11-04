#!/bin/bash
# Check routes on server

cd /var/www/nucleusai

echo "=== Checking dashboard.js routes ==="
grep -n "router.get" routes/dashboard.js | head -10

echo ""
echo "=== Checking route mounting in index.js ==="
grep -n "dashboard/api" index.js

echo ""
echo "=== Testing route directly ==="
curl -s http://localhost:3000/dashboard/api/calls?limit=5 2>&1 | head -5

echo ""
echo "=== Checking PM2 logs for errors ==="
pm2 logs nucleusai --lines 5 --nostream | tail -5

