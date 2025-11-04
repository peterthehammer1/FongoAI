#!/bin/bash
# Deploy 413 error fix to server
# Run this locally to copy files to server

SERVER_IP="134.122.37.50"

echo "📤 Deploying 413 error fix to server..."

# Copy updated index.js
echo "Copying index.js..."
scp index.js root@${SERVER_IP}:/var/www/nucleusai/index.js

# Copy updated nginx config
echo "Copying nginx config..."
scp nginx-nucleusai.conf root@${SERVER_IP}:/tmp/fongoai-nginx.conf

echo ""
echo "✅ Files copied!"
echo ""
echo "Now run these commands in DigitalOcean console:"
echo ""
echo "  # Update Nginx config"
echo "  sudo cp /tmp/fongoai-nginx.conf /etc/nginx/sites-available/fongoai.com"
echo "  sudo nginx -t"
echo "  sudo systemctl restart nginx"
echo ""
echo "  # Restart app"
echo "  cd /var/www/nucleusai"
echo "  pm2 restart nucleusai"
echo "  pm2 logs nucleusai --lines 20"

