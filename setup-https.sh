#!/bin/bash
# HTTPS Setup Script for fongoai.com
# Run this on your server: sudo bash setup-https.sh

set -e

echo "🔒 Setting up HTTPS for fongoai.com..."

# Step 1: Install Certbot
echo "📦 Installing Certbot..."
apt update
apt install -y certbot python3-certbot-nginx

# Step 2: Create certbot directory
echo "📁 Creating certbot directory..."
mkdir -p /var/www/certbot
chown -R www-data:www-data /var/www/certbot

# Step 3: Backup current Nginx config
echo "💾 Backing up current Nginx config..."
if [ -f /etc/nginx/sites-available/fongoai.com ]; then
    cp /etc/nginx/sites-available/fongoai.com /etc/nginx/sites-available/fongoai.com.backup.$(date +%Y%m%d_%H%M%S)
fi

# Step 4: Ensure firewall allows ports 80 and 443
echo "🔥 Configuring firewall..."
ufw allow 80/tcp
ufw allow 443/tcp

# Step 5: Test Nginx config
echo "🧪 Testing Nginx configuration..."
nginx -t

# Step 6: Get SSL certificate
echo "🔐 Getting SSL certificate from Let's Encrypt..."
echo "⚠️  You'll be prompted for:"
echo "   - Email address (for renewal reminders)"
echo "   - Agreement to terms"
echo "   - Redirect HTTP to HTTPS (recommended: Yes)"
echo ""
read -p "Press Enter to continue with certbot..."

certbot --nginx -d fongoai.com -d www.fongoai.com

# Step 7: Test renewal
echo "🔄 Testing certificate auto-renewal..."
certbot renew --dry-run

# Step 8: Reload Nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

echo ""
echo "✅ HTTPS setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Test: https://fongoai.com/dashboard"
echo "2. Update Retell AI webhook URL to: https://fongoai.com/webhook"
echo "3. Update Retell AI WebSocket URL to: wss://fongoai.com/llm-websocket"
echo ""
echo "🔒 Your site is now secure with HTTPS!"

