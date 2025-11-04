#!/bin/bash
# Fix dashboard route and file on server

cd /var/www/nucleusai

echo "=== Fixing Dashboard Route ==="

# 1. Check if route exists
if ! grep -q "app.get('/dashboard', requireAuth" index.js; then
    echo "Adding /dashboard route..."
    
    # Find where to insert (after /dashboard/call route)
    if grep -q "app.get('/dashboard/call/:callId'" index.js; then
        # Insert after the comprehensive-call route
        sed -i "/app.get('\/dashboard\/comprehensive-call/a\\
\\
// Dashboard homepage route (serve at /dashboard)\\
app.get('/dashboard', requireAuth, (req, res) => {\\
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));\\
});" index.js
    else
        # Insert before the API routes
        sed -i "/app.use('\/dashboard\/api', requireAuth, dashboardRoutes);/i\\
// Dashboard homepage route (serve at /dashboard)\\
app.get('/dashboard', requireAuth, (req, res) => {\\
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));\\
});" index.js
    fi
    echo "✅ Route added"
else
    echo "✅ Route already exists"
fi

# 2. Check dashboard.html size
DASHBOARD_SIZE=$(stat -c%s public/dashboard.html 2>/dev/null || echo "0")
if [ "$DASHBOARD_SIZE" -lt 1000 ]; then
    echo ""
    echo "⚠️  dashboard.html is too small ($DASHBOARD_SIZE bytes)"
    echo "   You need to upload the correct file from your local machine:"
    echo "   scp public/dashboard.html root@134.122.37.50:/var/www/nucleusai/public/"
else
    echo "✅ dashboard.html looks good ($DASHBOARD_SIZE bytes)"
fi

echo ""
echo "Restarting application..."
pm2 restart nucleusai

sleep 2
echo ""
echo "Testing route..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000/dashboard

echo ""
echo "✓ Done! Check if dashboard.html needs to be uploaded."

