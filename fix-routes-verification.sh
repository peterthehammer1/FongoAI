#!/bin/bash
# Verify and fix routes on server

cd /var/www/nucleusai

echo "=== Current routes in dashboard.js ==="
grep "router.get" routes/dashboard.js | head -5

echo ""
echo "=== Checking if routes still have /api prefix ==="
if grep -q "router.get('/api" routes/dashboard.js; then
    echo "❌ Routes still have /api prefix - fixing..."
    
    # More reliable fix - use Node.js to replace
    node << 'EOF'
const fs = require('fs');
let content = fs.readFileSync('routes/dashboard.js', 'utf8');
const original = content;

// Replace router.get('/api/ with router.get('/
content = content.replace(/router\.get\((['"])\/api\//g, "router.get($1/");

if (content !== original) {
    fs.writeFileSync('routes/dashboard.js', content);
    console.log('✓ Fixed routes in dashboard.js');
} else {
    console.log('Routes already fixed');
}
EOF
else
    echo "✓ Routes look correct (no /api prefix)"
fi

echo ""
echo "=== Verifying routes ==="
grep "router.get('/" routes/dashboard.js | head -5

echo ""
echo "=== Restarting app ==="
pm2 restart nucleusai

sleep 2
echo ""
echo "=== Testing ==="
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000/dashboard/api/calls

