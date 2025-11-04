# Manual Deployment Instructions for fongoai.com

Since automated SSH access isn't configured, follow these manual steps:

## Step 1: Copy Nginx Configuration to Server

From your local machine, manually transfer the file:

```bash
# Option A: If you have SSH access but need to specify a key
scp -i ~/.ssh/your_key nginx-nucleusai.conf root@134.122.37.50:/tmp/fongoai-nginx.conf

# Option B: If you have password-based SSH access
scp nginx-nucleusai.conf root@134.122.37.50:/tmp/fongoai-nginx.conf

# Option C: Use SFTP client (FileZilla, Cyberduck, etc.)
# - Connect to: sftp://134.122.37.50
# - Upload: nginx-nucleusai.conf to /tmp/fongoai-nginx.conf
```

## Step 2: SSH into Server and Configure

```bash
ssh root@134.122.37.50
```

Once connected, run these commands:

```bash
# Install Nginx config
sudo cp /tmp/fongoai-nginx.conf /etc/nginx/sites-available/fongoai.com
sudo ln -sf /etc/nginx/sites-available/fongoai.com /etc/nginx/sites-enabled/

# Remove default site if exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes (you'll see "syntax is ok" and "test is successful"), restart Nginx:
sudo systemctl restart nginx

# Verify Nginx is running
sudo systemctl status nginx
```

## Step 3: Ensure App is Running

On the server, run:

```bash
cd /var/www/nucleusai

# Check if app is running
pm2 status

# If app is not running or needs restart:
pm2 restart nucleusai

# Or if it doesn't exist:
pm2 start index.js --name nucleusai
pm2 save

# Check logs to verify
pm2 logs nucleusai --lines 20
```

## Step 4: Test the Setup

On the server, test:

```bash
# Test local connection
curl http://localhost:3000/health

# Should return: {"status":"OK","timestamp":"..."}
```

From your local machine or browser:

```bash
# Test via IP
curl http://134.122.37.50:3000/health

# Test via domain (after DNS propagates)
curl http://fongoai.com/health
```

## Step 5: Verify DNS is Set Up

Make sure your DNS has these A records:

```
Type: A
Name: @
Value: 134.122.37.50

Type: A
Name: www
Value: 134.122.37.50
```

Check DNS propagation:
```bash
nslookup fongoai.com
dig fongoai.com
```

## Step 6: Set Up SSL (Optional but Recommended)

On the server:

```bash
# Install Certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d fongoai.com -d www.fongoai.com

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended: option 2)
```

After SSL setup, the dashboard will be available at:
- `https://fongoai.com/`
- `https://www.fongoai.com/`

## Verification

After deployment, you should be able to access:

1. **Dashboard**: `http://fongoai.com/` (or `https://fongoai.com/` with SSL)
2. **Health Check**: `http://fongoai.com/health`
3. **Webhook**: `http://fongoai.com/webhook`

## Troubleshooting

### Nginx 502 Bad Gateway
- Check if app is running: `pm2 status`
- Restart app: `pm2 restart nucleusai`
- Check app logs: `pm2 logs nucleusai`

### Domain not resolving
- Wait for DNS propagation (5-60 minutes)
- Verify DNS records are correct
- Check with: `nslookup fongoai.com`

### Nginx configuration errors
- Test config: `sudo nginx -t`
- Check error log: `sudo tail -f /var/log/nginx/error.log`

## Next Steps

After deployment:
1. Test login at `http://fongoai.com/`
2. Verify dashboard loads correctly
3. Update Retell AI webhook URL to `http://fongoai.com/webhook` (or `https://` if SSL is set up)
4. Update Retell AI LLM WebSocket URL to `ws://fongoai.com/llm-websocket` (or `wss://` if SSL is set up)

