#!/bin/bash

# Script to start the Fongo AI Agent application on DigitalOcean server

SERVER_IP="134.122.37.50"
APP_DIR="/var/www/nucleusai"
APP_NAME="nucleusai"

echo "🚀 Starting Fongo AI Agent on DigitalOcean server..."

# Check if app is running
echo "📋 Checking PM2 status..."
pm2 status

# Check if app exists in PM2
if pm2 list | grep -q "$APP_NAME"; then
    echo "🔄 Restarting existing application..."
    pm2 restart $APP_NAME
else
    echo "➕ Starting new application..."
    cd $APP_DIR
    
    # Try to start with ecosystem.config.js first
    if [ -f "ecosystem.config.js" ]; then
        pm2 start ecosystem.config.js --name $APP_NAME
    elif [ -f "index.js" ]; then
        pm2 start index.js --name $APP_NAME
    else
        echo "❌ Error: Could not find index.js or ecosystem.config.js"
        exit 1
    fi
fi

# Save PM2 configuration
pm2 save

# Show status
echo ""
echo "✅ Application status:"
pm2 status

# Show recent logs
echo ""
echo "📝 Recent logs:"
pm2 logs $APP_NAME --lines 10 --nostream

# Check if port 3000 is listening
echo ""
echo "🔍 Checking if port 3000 is listening..."
if ss -tlnp | grep -q ":3000"; then
    echo "✅ Port 3000 is listening"
else
    echo "⚠️  Port 3000 is not listening - check logs above"
fi

# Test health endpoint
echo ""
echo "🧪 Testing health endpoint..."
sleep 2
curl -s http://localhost:3000/health || echo "❌ Health check failed"

echo ""
echo "✅ Done! Application should be running now."

