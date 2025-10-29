#!/bin/bash

# Server Status Check Script
# Run this on the server to diagnose issues

echo "🔍 Checking Fongo AI Server Status..."
echo "======================================"
echo ""

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 is not installed"
    exit 1
fi

# Check PM2 process status
echo "📊 PM2 Process Status:"
pm2 status
echo ""

# Check if process is running
if pm2 list | grep -q "nucleusai.*online"; then
    echo "✅ Process is running"
else
    echo "❌ Process is NOT running!"
    echo ""
    echo "🔧 Attempting to start the server..."
    
    # Try to find the app directory
    if [ -f "/var/www/nucleusai/ecosystem.config.js" ]; then
        cd /var/www/nucleusai
        pm2 start ecosystem.config.js
    elif [ -f "$(pwd)/ecosystem.config.js" ]; then
        pm2 start ecosystem.config.js
    else
        echo "⚠️  Could not find ecosystem.config.js"
        echo "   Please navigate to your app directory and run:"
        echo "   pm2 start ecosystem.config.js"
        exit 1
    fi
    
    sleep 2
    pm2 status
fi

echo ""
echo "📋 Recent Logs (last 20 lines):"
pm2 logs nucleusai --lines 20 --nostream

echo ""
echo "🔌 Checking Port 3000:"
if netstat -tlnp | grep -q ":3000"; then
    echo "✅ Port 3000 is listening"
    netstat -tlnp | grep ":3000"
else
    echo "❌ Port 3000 is NOT listening"
fi

echo ""
echo "🌐 Testing local connection:"
curl -s http://localhost:3000/health || echo "❌ Cannot connect to http://localhost:3000/health"

echo ""
echo "✨ Done!"

