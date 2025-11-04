#!/bin/bash
# Deploy improved error parsing to server

SERVER_IP="134.122.37.50"

echo "📤 Deploying improved error parsing fix to server..."

# Copy updated webhook.js
echo "Copying routes/webhook.js..."
scp routes/webhook.js root@${SERVER_IP}:/var/www/nucleusai/routes/webhook.js

echo ""
echo "✅ File copied!"
echo ""
echo "Now run these commands in DigitalOcean console:"
echo ""
echo "  cd /var/www/nucleusai"
echo "  pm2 restart nucleusai"
echo "  pm2 logs nucleusai --lines 20"

