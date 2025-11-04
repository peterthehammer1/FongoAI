#!/bin/bash
# Fix dashboard route - proper insertion

cd /var/www/nucleusai

echo "Checking current routes..."
grep -n "app.get\|app.use" index.js | grep dashboard

echo ""
echo "Finding insertion point..."
# Find the line number after comprehensive-call route
LINE=$(grep -n "app.get('/dashboard/comprehensive-call/:callId'" index.js | cut -d: -f1)
if [ -z "$LINE" ]; then
    echo "Could not find comprehensive-call route, trying different approach..."
    # Find line after dashboard/api
    LINE=$(grep -n "app.use('/dashboard/api'" index.js | cut -d: -f1)
    INSERT_AFTER=$((LINE + 1))
else
    # Find the closing }); for comprehensive-call
    INSERT_AFTER=$(sed -n "${LINE},${LINE}+10p" index.js | grep -n "});" | head -1 | cut -d: -f1)
    INSERT_AFTER=$((LINE + INSERT_AFTER))
fi

echo "Will insert after line $INSERT_AFTER"

# Create the route code
ROUTE_CODE="
// Dashboard homepage route (serve at /dashboard)
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});"

# Backup
cp index.js index.js.backup3

# Insert the route
sed -i "${INSERT_AFTER}a\\${ROUTE_CODE}" index.js

echo ""
echo "Verifying insertion..."
grep -A 3 "app.get('/dashboard', requireAuth" index.js

echo ""
echo "Checking syntax..."
node -c index.js && echo "✓ Syntax OK" || echo "❌ Syntax error"

echo ""
echo "Restarting..."
pm2 restart nucleusai

sleep 2
echo ""
echo "Testing..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000/dashboard

