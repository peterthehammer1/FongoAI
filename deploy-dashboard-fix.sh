#!/bin/bash
# Deploy dashboard route fix to DigitalOcean server

cd /var/www/nucleusai || exit 1

echo "Backing up files..."
cp index.js index.js.backup2
cp public/login.html public/login.html.backup2

echo "Applying fixes..."
# Fix route mounting - change /dashboard to /dashboard/api
sed -i "s|app.use('/dashboard', requireAuth, dashboardRoutes);|app.use('/dashboard/api', requireAuth, dashboardRoutes);|" index.js

# Fix login redirect - change / to /dashboard
sed -i "s|window.location.href = '/';|window.location.href = '/dashboard';|" public/login.html

echo "Restarting application..."
pm2 restart nucleusai

echo "Waiting for app to start..."
sleep 3

echo "Checking status..."
pm2 status nucleusai

echo ""
echo "Testing routes..."
curl -s http://localhost:3000/health | head -1
echo ""
echo "✓ Fix deployed!"
echo ""
echo "Try logging in now at http://fongoai.com/login"

