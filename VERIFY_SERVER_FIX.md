# Complete Server Verification & Fix

## Run This on Your DigitalOcean Server

```bash
cd /var/www/nucleusai

echo "=== 1. Check App Status ==="
pm2 status nucleusai
pm2 logs nucleusai --lines 5 --nostream | tail -5

echo ""
echo "=== 2. Check Nginx Status ==="
sudo systemctl status nginx | head -10

echo ""
echo "=== 3. Test App Directly ==="
curl -s http://localhost:3000/login | head -5

echo ""
echo "=== 4. Test Through Nginx ==="
curl -s -H "Host: fongoai.com" http://localhost/login | head -5

echo ""
echo "=== 5. Check Nginx Config ==="
sudo nginx -t

echo ""
echo "=== 6. Verify Nginx is Listening ==="
sudo netstat -tlnp | grep :80

echo ""
echo "=== 7. Check Firewall ==="
sudo ufw status

echo ""
echo "=== 8. Test from Outside ==="
curl -I http://fongoai.com/login 2>&1 | head -3
```

## If Nginx Config is Wrong

The config file might not be active. Check:

```bash
# Check what Nginx configs are active
ls -la /etc/nginx/sites-enabled/

# Check if fongoai.com config exists
ls -la /etc/nginx/sites-available/ | grep fongo

# If missing, create it:
sudo cp nginx-nucleusai.conf /etc/nginx/sites-available/fongoai.com
sudo ln -sf /etc/nginx/sites-available/fongoai.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

