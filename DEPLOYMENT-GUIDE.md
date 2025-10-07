# NUCLEUS AI Server Deployment Guide

## 🚀 **Step 1: Get a VPS Server**

### **Recommended Providers:**
- **DigitalOcean**: $5-10/month, 1GB RAM, 1 CPU
- **Linode**: $5-10/month, 1GB RAM, 1 CPU  
- **Vultr**: $3.50-6/month, 1GB RAM, 1 CPU
- **AWS EC2**: $8-15/month, t3.micro instance

### **Server Requirements:**
- Ubuntu 20.04 LTS or newer
- 1GB RAM minimum
- 25GB SSD storage
- Static IP address (usually included)

## 🔧 **Step 2: Server Setup**

### **Connect to your server:**
```bash
ssh root@YOUR_SERVER_IP
```

### **Run the deployment script:**
```bash
# Upload the deployment script to your server
scp deploy-server.sh root@YOUR_SERVER_IP:/root/
ssh root@YOUR_SERVER_IP
chmod +x deploy-server.sh
./deploy-server.sh
```

## 🌐 **Step 3: Domain Configuration**

### **DNS Settings:**
Point your domain `nucleusai.com` to your server:

```
Type: A
Name: @
Value: YOUR_SERVER_IP

Type: A  
Name: www
Value: YOUR_SERVER_IP
```

## 🔐 **Step 4: SSL Certificate (Optional but Recommended)**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d nucleusai.com -d www.nucleusai.com

# Auto-renewal
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📋 **Step 5: Environment Variables**

The deployment script creates a `.env` file with:
```bash
NUCLEUS_API_KEY=key_dfc6862d300570f9dc8950062ea8
NUCLEUS_AGENT_ID=agent_c0b3d0217ea4dbcd6feb9c690c
WEBHOOK_SECRET=fongo-webhook-secret-2025
FONGO_API_URL=https://secure.freephoneline.ca/mobile/updatecc.pl
NODE_ENV=production
DOMAIN=nucleusai.com
```

## 🧪 **Step 6: Test the Deployment**

```bash
# Check if the app is running
pm2 status

# Check logs
pm2 logs nucleusai

# Test endpoints
curl http://nucleusai.com/health
curl -X POST http://nucleusai.com/webhook -H "Content-Type: application/json" -d '{"event": "test"}'
```

## 🔒 **Step 7: IP Whitelisting**

### **Get your server's IP:**
```bash
curl ifconfig.me
```

### **Give this IP to Fabio:**
```
Server IP: YOUR_SERVER_IP
Domain: nucleusai.com
Purpose: Fongo Credit Card AI Agent
```

## 📞 **Step 8: Update Retell AI Agent**

1. Import the updated `retell-agent-config.json`
2. Assign to phone number: `+12892714328`
3. Test with a real call

## 🔧 **Management Commands**

```bash
# Restart the app
pm2 restart nucleusai

# View logs
pm2 logs nucleusai

# Monitor
pm2 monit

# Stop
pm2 stop nucleusai

# Start
pm2 start nucleusai
```

## 🚨 **Troubleshooting**

### **If the app won't start:**
```bash
# Check logs
pm2 logs nucleusai

# Check if port 3000 is in use
sudo netstat -tlnp | grep :3000

# Restart nginx
sudo systemctl restart nginx
```

### **If webhook isn't working:**
```bash
# Test locally
curl http://localhost:3000/health

# Check nginx config
sudo nginx -t

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
```

## ✅ **Success Indicators**

- ✅ `curl http://nucleusai.com/health` returns `{"status":"OK"}`
- ✅ Webhook responds to POST requests
- ✅ WebSocket connection works
- ✅ Fongo API calls succeed (after IP whitelisting)
- ✅ Phone calls work end-to-end

## 📞 **Final Test**

Call `+12892714328` and follow the conversation flow to test the complete system!
