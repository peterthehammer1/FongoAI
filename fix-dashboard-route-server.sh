#!/bin/bash
# Fix dashboard route on server

cd /var/www/nucleusai

echo "Checking if /dashboard route exists..."
if grep -q "app.get('/dashboard', requireAuth" index.js; then
    echo "✅ Route exists in index.js"
else
    echo "❌ Route missing - adding it..."
    
    # Find where to insert (after comprehensive-call route)
    if grep -q "app.get('/dashboard/comprehensive-call/:callId'" index.js; then
        # Insert after comprehensive-call route
        sed -i "/app.get('\/dashboard\/comprehensive-call\/:callId'/,/});/a\\
\\
// Dashboard homepage route (serve at /dashboard)\\
app.get('/dashboard', requireAuth, (req, res) => {\\
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));\\
});" index.js
        echo "✅ Route added"
    else
        echo "❌ Could not find insertion point"
    fi
fi

echo ""
echo "Verifying route..."
grep -A 2 "app.get('/dashboard', requireAuth" index.js

echo ""
echo "Restarting app..."
pm2 restart nucleusai

sleep 2
echo ""
echo "Testing route..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000/dashboard

echo ""
echo "✓ Done!"

