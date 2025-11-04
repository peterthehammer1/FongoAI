# DigitalOcean Setup Summary - Fongo Credit Card AI Agent

## 🖥️ Server Information

**Server IP**: `134.122.37.50`  
**Provider**: DigitalOcean  
**SSH Access**: `ssh root@134.122.37.50`  
**App Directory**: `/var/www/nucleusai`

---

## 📦 What's Installed

### 1. **Node.js**
- Version: Node.js 18+ (recommended)
- Installed via: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -`

### 2. **PM2 Process Manager**
- Used to run the Node.js application
- Process name: `nucleusai`
- Auto-restart on server reboot
- Logs stored in: `/var/log/pm2/`

### 3. **Nginx Web Server**
- Reverse proxy for `fongoai.com`
- Configuration: `/etc/nginx/sites-available/fongoai.com`
- Listens on port 80 (HTTP)
- Proxies to: `http://localhost:3000`

### 4. **Application Code**
- Location: `/var/www/nucleusai`
- Main file: `index.js`
- Runs on port: `3000`

---

## 🔧 Application Configuration

### **PM2 Configuration** (`ecosystem.config.js`)
```javascript
{
  name: 'nucleusai',
  script: 'index.js',
  instances: 1,
  exec_mode: 'cluster',
  env: {
    NODE_ENV: 'production',
    PORT: 3000
  }
}
```

### **Nginx Configuration** (`nginx-nucleusai.conf`)
- **Domain**: `fongoai.com` and `www.fongoai.com`
- **Routes**:
  - `/` → Dashboard (port 3000)
  - `/webhook` → Retell AI webhooks (port 3000)
  - `/llm-websocket` → WebSocket for LLM (port 3000)
  - `/health` → Health check endpoint (port 3000)
  - `/dashboard` → Dashboard (port 3000)
  - `/dashboard/call/:callId` → Call details page (port 3000)

### **Environment Variables** (`.env` file)
Should be located at `/var/www/nucleusai/.env`:
```env
NODE_ENV=production
PORT=3000
SESSION_SECRET=fongo-nucleus-ai-secret-key-2025
NUCLEUS_API_KEY=key_dfc6862d300570f9dc8950062ea8
NUCLEUS_AGENT_ID=agent_c0b3d0217ea4dbcd6feb9c690c
WEBHOOK_SECRET=fongo-webhook-secret-2025
FONGO_API_URL=https://secure.freephoneline.ca/mobile/updatecc.pl
DOMAIN=fongoai.com
```

---

## 📊 Database

### **SQLite Databases**
- **Main database**: `/var/www/nucleusai/database/calls.db`
  - Stores call logs, payment info, transcripts
- **Comprehensive database**: `/var/www/nucleusai/database/fongo_comprehensive.db`
  - Stores all 30+ Retell AI webhook data fields

### **Database Tables**
- `call_logs` - Main call information
- `call_logs_comprehensive` - Complete Retell AI data
- `sms_logs` - SMS tracking
- `webhook_events` - Webhook event tracking

---

## 🌐 Endpoints & URLs

### **Public Endpoints**
- **Health Check**: `http://134.122.37.50:3000/health`
- **Webhook**: `http://134.122.37.50:3000/webhook` (for Retell AI)
- **WebSocket**: `ws://134.122.37.50:3000/llm-websocket` (for Retell AI LLM)

### **Protected Endpoints** (Require Authentication)
- **Dashboard**: `http://134.122.37.50:3000/` or `http://134.122.37.50:3000/dashboard`
- **Login**: `http://134.122.37.50:3000/login`
- **Call Details**: `http://134.122.37.50:3000/dashboard/call/:callId`
- **API**: `http://134.122.37.50:3000/dashboard/api/*`

### **Domain URLs** (After DNS is configured)
- **Dashboard**: `http://fongoai.com/` or `http://fongoai.com/dashboard`
- **Webhook**: `http://fongoai.com/webhook`
- **WebSocket**: `ws://fongoai.com/llm-websocket`

---

## 👥 User Accounts

### **Dashboard Login Credentials**
1. **Pete (Nucleus AI)**
   - Email: `pete@nucleus.com`
   - Password: `NucleusAI2025!Secure`

2. **Joe (Fongo)**
   - Email: `joe@fongo.com`
   - Password: `FongoAdmin2025#Safe`

---

## 🔐 Security Features

1. **Authentication Required**
   - Dashboard requires login
   - Sessions expire after 24 hours
   - Passwords encrypted with bcrypt

2. **Security Headers** (via Nginx)
   - X-Frame-Options: SAMEORIGIN
   - X-XSS-Protection: 1; mode=block
   - X-Content-Type-Options: nosniff
   - Content-Security-Policy

3. **Data Protection**
   - Only last 4 digits of credit cards stored
   - CVV never stored
   - Full card number only in memory during call

---

## 📋 Current Status Checklist

### ✅ Should Be Configured:
- [ ] Node.js installed
- [ ] PM2 installed and running
- [ ] Application code in `/var/www/nucleusai`
- [ ] Nginx installed and configured
- [ ] Nginx config file: `/etc/nginx/sites-available/fongoai.com`
- [ ] Nginx site enabled: `/etc/nginx/sites-enabled/fongoai.com`
- [ ] PM2 process `nucleusai` running
- [ ] Application listening on port 3000
- [ ] Database files created
- [ ] Environment variables set

### ⚠️ Needs Verification:
- [ ] DNS pointing to `134.122.37.50`
- [ ] SSL certificate (optional but recommended)
- [ ] Firewall configured (UFW)
- [ ] Server accessible from internet

---

## 🚀 Quick Commands

### **Check Server Status**
```bash
ssh root@134.122.37.50 "pm2 status && sudo systemctl status nginx | head -5 && curl -s http://localhost:3000/health"
```

### **Check Application**
```bash
ssh root@134.122.37.50 "cd /var/www/nucleusai && pm2 status"
```

### **Restart Application**
```bash
ssh root@134.122.37.50 "cd /var/www/nucleusai && pm2 restart nucleusai"
```

### **View Logs**
```bash
ssh root@134.122.37.50 "pm2 logs nucleusai --lines 50"
```

### **Check Nginx**
```bash
ssh root@134.122.37.50 "sudo nginx -t && sudo systemctl status nginx"
```

### **Check Port 3000**
```bash
ssh root@134.122.37.50 "ss -tlnp | grep 3000"
```

---

## 📝 What Needs to Be Done

### **To Complete Setup:**

1. **Deploy Nginx Configuration**
   ```bash
   scp nginx-nucleusai.conf root@134.122.37.50:/tmp/fongoai-nginx.conf
   ssh root@134.122.37.50
   sudo cp /tmp/fongoai-nginx.conf /etc/nginx/sites-available/fongoai.com
   sudo ln -sf /etc/nginx/sites-available/fongoai.com /etc/nginx/sites-enabled/
   sudo rm -f /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl restart nginx
   ```

2. **Ensure Application is Running**
   ```bash
   ssh root@134.122.37.50
   cd /var/www/nucleusai
   pm2 restart nucleusai
   pm2 save
   ```

3. **Update DNS Records**
   - Point `fongoai.com` A record to `134.122.37.50`
   - Point `www.fongoai.com` A record to `134.122.37.50`
   - Remove any Vercel CNAME records

4. **Set Up SSL (Optional but Recommended)**
   ```bash
   ssh root@134.122.37.50
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d fongoai.com -d www.fongoai.com
   ```

---

## 🔍 Troubleshooting

### **If Dashboard Not Loading:**
1. Check PM2: `pm2 status`
2. Check Nginx: `sudo systemctl status nginx`
3. Check logs: `pm2 logs nucleusai`
4. Check port: `ss -tlnp | grep 3000`

### **If 502 Bad Gateway:**
- Application not running → `pm2 restart nucleusai`
- Port 3000 not listening → Check application logs

### **If DNS Not Working:**
- Verify DNS records point to `134.122.37.50`
- Wait for DNS propagation (5-60 minutes)
- Test with: `nslookup fongoai.com`

---

## 📞 Retell AI Configuration

### **Webhook URL**
- Current: `http://134.122.37.50:3000/webhook`
- Should be: `http://fongoai.com/webhook` (after DNS)
- Or: `https://fongoai.com/webhook` (after SSL)

### **LLM WebSocket URL**
- Current: `ws://134.122.37.50:3000/llm-websocket`
- Should be: `ws://fongoai.com/llm-websocket` (after DNS)
- Or: `wss://fongoai.com/llm-websocket` (after SSL)

---

## 📚 Files on Server

### **Key Directories:**
```
/var/www/nucleusai/
├── index.js              # Main application
├── package.json          # Dependencies
├── .env                  # Environment variables
├── ecosystem.config.js   # PM2 configuration
├── database/
│   ├── calls.db         # Main database
│   └── fongo_comprehensive.db  # Comprehensive database
├── public/              # Dashboard HTML files
│   ├── dashboard.html
│   ├── call-details.html
│   └── login.html
├── routes/              # API routes
├── services/            # Business logic
└── middleware/         # Auth middleware
```

---

## ✅ Verification Checklist

Run these commands to verify everything is set up:

```bash
# 1. Can you SSH into the server?
ssh root@134.122.37.50

# 2. Is the application running?
pm2 status

# 3. Is Nginx running?
sudo systemctl status nginx

# 4. Is the app responding?
curl http://localhost:3000/health

# 5. Is Nginx proxying correctly?
curl http://localhost/health

# 6. Is port 3000 listening?
ss -tlnp | grep 3000
```

---

**Last Updated**: Based on current codebase configuration  
**Server IP**: 134.122.37.50  
**Domain**: fongoai.com

