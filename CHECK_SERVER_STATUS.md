# Check Server Status - Run These Commands

## In DigitalOcean Console, run these commands:

```bash
# 1. Check if the Node.js app is running
pm2 status

# 2. Check PM2 logs for errors
pm2 logs nucleusai --lines 50

# 3. Check if Nginx is running
sudo systemctl status nginx

# 4. Check Nginx error logs
sudo tail -50 /var/log/nginx/error.log

# 5. Check if port 3000 is listening (Node.js app)
sudo netstat -tlnp | grep 3000

# 6. Test the app directly
curl http://localhost:3000/health

# 7. Test Nginx
curl http://localhost/health

# 8. Check if the server is accessible
curl http://134.122.37.50/health
```

## Quick Fixes:

### If PM2 shows the app is down:
```bash
cd /var/www/nucleusai
pm2 restart nucleusai
pm2 logs nucleusai --lines 20
```

### If Nginx is down:
```bash
sudo systemctl restart nginx
sudo nginx -t
```

### If there's a 502 Bad Gateway:
The app might have crashed. Check logs and restart:
```bash
pm2 logs nucleusai --lines 50
pm2 restart nucleusai
```

