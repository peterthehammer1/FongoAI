#!/bin/bash
# Diagnose why dashboard returns 404

cd /var/www/nucleusai

echo "=== 1. Check if route exists ==="
grep -n "app.get('/dashboard" index.js

echo ""
echo "=== 2. Check route order (should be before catch-all) ==="
grep -n "app.get\|app.use" index.js | grep -E "dashboard|/\)" | head -10

echo ""
echo "=== 3. Check if dashboard.html exists ==="
ls -lh public/dashboard.html

echo ""
echo "=== 4. Test route directly (should redirect to login if not authenticated) ==="
curl -v http://localhost:3000/dashboard 2>&1 | grep -E "HTTP|Location" | head -3

echo ""
echo "=== 5. Check for syntax errors ==="
node -c index.js && echo "✓ No syntax errors" || echo "❌ Syntax error found"

echo ""
echo "=== 6. Check PM2 logs for errors ==="
pm2 logs nucleusai --lines 5 --nostream | tail -5
