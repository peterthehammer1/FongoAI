#!/bin/bash
# Fix call route if needed

cd /var/www/nucleusai

echo "=== Checking call route ==="
grep -A 3 "router.get('/call/:callId" routes/dashboard.js || grep -A 3 "router.get('call/:callId" routes/dashboard.js || echo "Route not found with /call"

echo ""
echo "=== Checking if route has correct leading slash ==="
if grep -q "router.get('call/:callId" routes/dashboard.js; then
    echo "❌ Route missing leading slash - fixing..."
    sed -i "s|router.get('call/:callId|router.get('/call/:callId|g" routes/dashboard.js
    echo "✓ Fixed"
elif grep -q 'router.get("call/:callId' routes/dashboard.js; then
    echo "❌ Route missing leading slash - fixing..."
    sed -i 's|router.get("call/:callId|router.get("/call/:callId|g' routes/dashboard.js
    echo "✓ Fixed"
else
    echo "✓ Route looks correct"
fi

echo ""
echo "=== Verifying ==="
grep "router.get.*call.*:callId" routes/dashboard.js

echo ""
echo "=== Restarting ==="
pm2 restart nucleusai

