#!/bin/bash
# Final fix for dashboard route

cd /var/www/nucleusai

echo "=== Current state ==="
grep -n "app.get('/dashboard" index.js || echo "Route NOT found!"

echo ""
echo "=== Checking route order ==="
grep -n "app.get\|app.use" index.js | grep -E "dashboard|'/\|'/\*" 

echo ""
echo "=== Fixing: Adding route after comprehensive-call ==="

# Find the line number of the closing }); for comprehensive-call route
COMPREHENSIVE_LINE=$(grep -n "app.get('/dashboard/comprehensive-call/:callId'" index.js | cut -d: -f1)

if [ -z "$COMPREHENSIVE_LINE" ]; then
    echo "❌ Could not find comprehensive-call route"
    exit 1
fi

# Find the closing }); after comprehensive-call (should be 2-3 lines later)
END_LINE=$((COMPREHENSIVE_LINE + 5))
INSERT_AFTER=$(sed -n "${COMPREHENSIVE_LINE},${END_LINE}p" index.js | grep -n "});" | head -1 | cut -d: -f1)
INSERT_AFTER=$((COMPREHENSIVE_LINE + INSERT_AFTER - 1))

echo "Inserting route after line $INSERT_AFTER"

# Backup
cp index.js index.js.backup4

# Check if route already exists at this location
if grep -q "app.get('/dashboard', requireAuth" index.js; then
    echo "Route exists but might be in wrong place. Checking..."
    ROUTE_LINE=$(grep -n "app.get('/dashboard', requireAuth" index.js | cut -d: -f1)
    echo "Route found at line $ROUTE_LINE"
    if [ "$ROUTE_LINE" -lt "$INSERT_AFTER" ]; then
        echo "Route is in wrong position. Moving..."
        # Remove old route
        sed -i "${ROUTE_LINE},${ROUTE_LINE}+3d" index.js
        INSERT_AFTER=$((INSERT_AFTER - 4))
    fi
fi

# Insert the route
sed -i "${INSERT_AFTER}a\\
\\
// Dashboard homepage route (serve at /dashboard)\\
app.get('/dashboard', requireAuth, (req, res) => {\\
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));\\
});" index.js

echo ""
echo "=== Verifying ==="
grep -n "app.get('/dashboard" index.js

echo ""
echo "=== Checking syntax ==="
node -c index.js && echo "✓ Syntax OK" || (echo "❌ Syntax error" && exit 1)

echo ""
echo "=== Restarting ==="
pm2 restart nucleusai

sleep 3
echo ""
echo "=== Testing ==="
curl -v http://localhost:3000/dashboard 2>&1 | grep -E "HTTP|Location" | head -3

echo ""
echo "✓ Done!"

