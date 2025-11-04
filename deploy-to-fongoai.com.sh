#!/bin/bash

# Deploy Fongo Dashboard to fongoai.com
# This script sets up Nginx to serve the dashboard at fongoai.com

SERVER_IP="134.122.37.50"
APP_DIR="/var/www/nucleusai"
NGINX_SITE="fongoai.com"

echo "🚀 Deploying Dashboard to fongoai.com..."

# Step 1: Copy Nginx configuration
echo "📋 Copying Nginx configuration..."
scp nginx-nucleusai.conf root@${SERVER_IP}:/tmp/fongoai-nginx.conf

if [ $? -ne 0 ]; then
    echo "❌ Failed to copy Nginx config. Check SSH access."
    exit 1
fi

# Step 2: Configure Nginx on server
echo "🔧 Configuring Nginx on server..."
ssh root@${SERVER_IP} << 'ENDSSH'
    # Install Nginx config
    sudo cp /tmp/fongoai-nginx.conf /etc/nginx/sites-available/fongoai.com
    sudo ln -sf /etc/nginx/sites-available/fongoai.com /etc/nginx/sites-enabled/
    
    # Remove default site if exists
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    if sudo nginx -t; then
        echo "✅ Nginx configuration is valid"
        sudo systemctl restart nginx
        echo "✅ Nginx restarted"
    else
        echo "❌ Nginx configuration test failed"
        exit 1
    fi
ENDSSH

if [ $? -ne 0 ]; then
    echo "❌ Failed to configure Nginx"
    exit 1
fi

# Step 3: Ensure app is running
echo "🔍 Checking if app is running..."
ssh root@${SERVER_IP} << ENDSSH
    cd ${APP_DIR}
    
    # Check PM2 status
    if pm2 list | grep -q "nucleusai"; then
        echo "✅ App is running"
        pm2 restart nucleusai
        echo "✅ App restarted"
    else
        echo "⚠️  App not running, starting it..."
        if [ -f ecosystem.config.js ]; then
            pm2 start ecosystem.config.js --name nucleusai
        else
            pm2 start index.js --name nucleusai
        fi
        pm2 save
        echo "✅ App started"
    fi
ENDSSH

# Step 4: Test endpoints
echo "🧪 Testing endpoints..."
echo "Testing health endpoint..."
curl -s -o /dev/null -w "Health check: %{http_code}\n" http://${SERVER_IP}:3000/health

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Verify DNS is pointing to ${SERVER_IP}:"
echo "   - A record: @ → ${SERVER_IP}"
echo "   - A record: www → ${SERVER_IP}"
echo ""
echo "2. Wait for DNS propagation (5-60 minutes)"
echo ""
echo "3. Test access:"
echo "   - http://fongoai.com/health"
echo "   - http://fongoai.com/"
echo ""
echo "4. Set up SSL (optional but recommended):"
echo "   ssh root@${SERVER_IP}"
echo "   sudo apt install -y certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d fongoai.com -d www.fongoai.com"
echo ""
echo "🎉 Dashboard will be available at:"
echo "   - http://fongoai.com/"
echo "   - https://fongoai.com/ (after SSL setup)"

