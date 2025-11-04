# Deployment Status

## Server Configuration

### Primary Production Server (DigitalOcean)
- **IP Address**: `134.122.37.50`
- **Port**: `3000`
- **Domain**: `fongoai.com`
- **Dashboard**: `http://fongoai.com/` or `https://fongoai.com/` (with SSL)
- **Direct IP**: `http://134.122.37.50:3000/`
- **Webhook URL**: `http://fongoai.com/webhook` or `https://fongoai.com/webhook` (with SSL)
- **SSH**: `ssh root@134.122.37.50`
- **App Directory**: `/var/www/nucleusai`
- **Process Manager**: PM2 (`nucleusai`)
- **Nginx**: Reverse proxy configured for `fongoai.com`

### Nucleus AI Configuration
- **Webhook**: `http://134.122.37.50:3000/webhook` → DigitalOcean server
- **Agent ID**: (see Nucleus dashboard)

### Vercel Deployment
- **Status**: ❌ NOT USED (old deployment, can be removed)
- **Note**: The app is NOT designed for Vercel due to:
  - SQLite database (file system is read-only on Vercel)
  - WebSocket server (not supported on Vercel serverless)
  - Session storage (needs persistent storage)

## Quick Fix Commands

### Check if server is running:
```bash
ssh root@134.122.37.50 "pm2 status"
```

### Restart the server:
```bash
ssh root@134.122.37.50 "cd /var/www/nucleusai && pm2 restart nucleusai"
```

### Check server logs:
```bash
ssh root@134.122.37.50 "pm2 logs nucleusai --lines 50"
```

### Deploy latest code:
```bash
# From your local machine
git push

# On server
ssh root@134.122.37.50 "cd /var/www/nucleusai && git pull && pm2 restart nucleusai"
```

### Test if server is responding:
```bash
curl http://134.122.37.50:3000/health
```

