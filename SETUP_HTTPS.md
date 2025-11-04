# Setting Up HTTPS for fongoai.com

This guide will help you set up SSL/HTTPS using Let's Encrypt (free SSL certificates).

## Prerequisites

1. Domain `fongoai.com` must be pointing to your server IP (134.122.37.50)
2. Ports 80 and 443 must be open in your firewall
3. Nginx must be installed and running

## Step 1: Verify DNS and Firewall

Run these commands on your server:

```bash
# Check DNS resolution
dig fongoai.com +short
dig www.fongoai.com +short
# Both should return: 134.122.37.50

# Check firewall
sudo ufw status
# Make sure ports 80 and 443 are open:
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## Step 2: Install Certbot

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

## Step 3: Create Certbot Directory (for HTTP challenge)

```bash
sudo mkdir -p /var/www/certbot
sudo chown -R www-data:www-data /var/www/certbot
```

## Step 4: Update Nginx Configuration

First, create the HTTP-only config (for the initial certificate request):

```bash
sudo cp /etc/nginx/sites-available/fongoai.com /etc/nginx/sites-available/fongoai.com.backup
```

Then update the Nginx config to allow Certbot access. The current config should work, but make sure it includes:

```nginx
location /.well-known/acme-challenge/ {
    root /var/www/certbot;
}
```

## Step 5: Get SSL Certificate

Run Certbot to automatically configure SSL:

```bash
sudo certbot --nginx -d fongoai.com -d www.fongoai.com
```

This will:
- Request a certificate from Let's Encrypt
- Verify your domain ownership
- Automatically update your Nginx configuration
- Set up automatic renewal

**Follow the prompts:**
- Enter your email address (for renewal reminders)
- Agree to terms of service
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

## Step 6: Verify Certificate

```bash
# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Test HTTPS
curl -I https://fongoai.com/health
```

## Step 7: Set Up Auto-Renewal

Certbot certificates expire every 90 days. Auto-renewal should be set up automatically, but verify:

```bash
# Test renewal
sudo certbot renew --dry-run

# Check if cron job exists
sudo systemctl status certbot.timer
```

## Step 8: Update Retell AI Configuration

After HTTPS is working, update your Retell AI agent:

- **Webhook URL**: `https://fongoai.com/webhook`
- **LLM WebSocket URL**: `wss://fongoai.com/llm-websocket` (note: `wss://` not `ws://`)

## Troubleshooting

### "No such authorization" Error

This means Let's Encrypt can't verify your domain. Check:

1. **DNS Propagation**: Wait 24-48 hours after DNS changes
2. **Port 80 Access**: Let's Encrypt needs HTTP access
   ```bash
   # From your local machine:
   curl -I http://fongoai.com/.well-known/acme-challenge/test
   ```
3. **Nginx Running**: 
   ```bash
   sudo systemctl status nginx
   ```

### Certificate Already Exists

If you get an error about existing certificates:

```bash
# List existing certificates
sudo certbot certificates

# Delete and recreate if needed
sudo certbot delete --cert-name fongoai.com
```

### Manual Certificate Installation

If automatic configuration fails, you can manually install:

```bash
# Get certificate only (no auto-config)
sudo certbot certonly --nginx -d fongoai.com -d www.fongoai.com

# Then manually update nginx config with certificate paths
```

## After Setup

Once HTTPS is working:

1. ✅ Test: `https://fongoai.com/dashboard`
2. ✅ Update Retell AI webhook URLs to use `https://`
3. ✅ Update Retell AI WebSocket URL to use `wss://`
4. ✅ Verify automatic redirect from HTTP to HTTPS

Your site will now be secure with a valid SSL certificate! 🔒

