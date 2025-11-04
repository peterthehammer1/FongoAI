# Start Server Instructions

Since I don't have direct SSH access, here are the commands to run:

## Quick Start (Copy & Paste)

```bash
ssh root@134.122.37.50 << 'EOF'
cd /var/www/nucleusai
pm2 status
pm2 restart nucleusai || pm2 start index.js --name nucleusai
pm2 save
pm2 logs nucleusai --lines 20
curl -s http://localhost:3000/health
EOF
```

## Step by Step

1. **SSH into server:**
   ```bash
   ssh root@134.122.37.50
   ```

2. **Navigate to app directory:**
   ```bash
   cd /var/www/nucleusai
   ```

3. **Check current status:**
   ```bash
   pm2 status
   ```

4. **Start/Restart the application:**
   ```bash
   # If it exists, restart it
   pm2 restart nucleusai
   
   # If it doesn't exist, start it
   pm2 start index.js --name nucleusai
   
   # Or if you have ecosystem.config.js:
   pm2 start ecosystem.config.js --name nucleusai
   ```

5. **Save PM2 configuration:**
   ```bash
   pm2 save
   ```

6. **Check logs:**
   ```bash
   pm2 logs nucleusai --lines 20
   ```

7. **Test health endpoint:**
   ```bash
   curl http://localhost:3000/health
   ```

8. **Verify port is listening:**
   ```bash
   ss -tlnp | grep 3000
   ```

## Troubleshooting

### If app won't start:
```bash
# Check for errors
pm2 logs nucleusai --err

# Check if port is in use
lsof -i :3000

# Check Node.js version
node --version

# Install dependencies if needed
cd /var/www/nucleusai
npm install
```

### If port 3000 is blocked:
```bash
# Check firewall
sudo ufw status

# Allow port 3000 if needed
sudo ufw allow 3000
```

### If Nginx shows 502:
```bash
# Restart Nginx
sudo systemctl restart nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

