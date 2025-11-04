#!/bin/bash
# Quick fix script to copy the missing monitoring route to server

echo "📤 Copying missing files to server..."

# Copy monitoring route
scp routes/monitoring.js root@134.122.37.50:/var/www/nucleusai/routes/monitoring.js

# Copy updated index.js
scp index.js root@134.122.37.50:/var/www/nucleusai/index.js

echo "✅ Files copied!"
echo ""
echo "Now run in the DigitalOcean console:"
echo "  cd /var/www/nucleusai"
echo "  pm2 restart nucleusai"
echo "  pm2 logs nucleusai --lines 20"

