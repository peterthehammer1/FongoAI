# Deploy Dashboard to fongoai.com

## Current Setup

- **Server IP**: `134.122.37.50`
- **App Port**: `3000`
- **Domain**: `fongoai.com`
- **App Directory**: `/var/www/nucleusai`

## Step 1: Deploy Nginx Configuration to Server

```bash
# Copy Nginx config to server
scp nginx-nucleusai.conf root@134.122.37.50:/tmp/fongoai-nginx.conf

# SSH into server
ssh root@134.122.37.50

# Install Nginx config
sudo cp /tmp/fongoai-nginx.conf /etc/nginx/sites-available/fongoai.com
sudo ln -sf /etc/nginx/sites-available/fongoai.com /etc/nginx/sites-enabled/

# Remove default site if exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, restart Nginx
sudo systemctl restart nginx
```

## Step 2: Configure DNS

Make sure your DNS records point to the server:

**A Records:**
```
Type: A
Name: @
Value: 134.122.37.50

Type: A
Name: www
Value: 134.122.37.50
```

Wait for DNS propagation (usually 5-60 minutes).

## Step 3: Ensure App is Running

```bash
# SSH into server
ssh root@134.122.37.50

# Check if app is running
cd /var/www/nucleusai
pm2 status

# If not running, start it
pm2 start ecosystem.config.js --name nucleusai
# Or restart if already running
pm2 restart nucleusai

# Check logs
pm2 logs nucleusai --lines 50
```

## Step 4: Set Up SSL (HTTPS) - Recommended

```bash
# SSH into server
ssh root@134.122.37.50

# Install Certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d fongoai.com -d www.fongoai.com

# Follow prompts:
# - Enter email for urgent renewal notices
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)

# Auto-renewal is set up automatically
```

After SSL setup, the dashboard will be available at:
- **https://fongoai.com**
- **https://www.fongoai.com**

## Step 5: Test Access

### HTTP (before SSL):
```bash
curl http://fongoai.com/health
curl http://fongoai.com/
```

### HTTPS (after SSL):
```bash
curl https://fongoai.com/health
curl https://fongoai.com/
```

## Step 6: Verify Dashboard Access

1. Open browser: `http://fongoai.com` or `https://fongoai.com` (after SSL)
2. You should see the login page
3. Login with:
   - Email: `pete@nucleus.com`
   - Password: `NucleusAI2025!Secure`

## Troubleshooting

### Dashboard not loading?
```bash
# Check Nginx status
sudo systemctl status nginx

# Check app status
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check app logs
pm2 logs nucleusai
```

### Nginx 502 Bad Gateway?
```bash
# App might not be running
pm2 restart nucleusai

# Check if port 3000 is listening
netstat -tlnp | grep 3000
# Or
ss -tlnp | grep 3000
```

### DNS not resolving?
```bash
# Check DNS propagation
dig fongoai.com
nslookup fongoai.com

# Verify A record points to 134.122.37.50
```

## Quick Status Check

```bash
# Run this script to check everything
ssh root@134.122.37.50 "pm2 status && sudo systemctl status nginx | head -5 && curl -s http://localhost:3000/health"
```

## After Deployment

The dashboard will be accessible at:
- **Dashboard**: `http://fongoai.com/` (or `https://fongoai.com/` with SSL)
- **Webhook**: `http://fongoai.com/webhook` (or `https://fongoai.com/webhook` with SSL)
- **Health Check**: `http://fongoai.com/health` (or `https://fongoai.com/health` with SSL)

## Update Retell AI Webhook URL

After deployment, update the Retell AI agent configuration:
1. Go to Retell AI Dashboard
2. Update webhook URL to: `https://fongoai.com/webhook` (or `http://fongoai.com/webhook` if no SSL)
3. Update LLM WebSocket URL to: `wss://fongoai.com/llm-websocket` (or `ws://fongoai.com/llm-websocket` if no SSL)

