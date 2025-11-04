# Apply 413 Error Fix on Server

## Quick Fix Commands

Copy and paste these commands into the DigitalOcean console:

```bash
cd /var/www/nucleusai

# Update index.js - add body size limit
sed -i "s|app.use(express.json());|app.use(express.json({ limit: '10mb' }));|" index.js

# Add urlencoded parser
sed -i "/express.json({ limit: '10mb' });/a app.use(express.urlencoded({ extended: true, limit: '10mb' }));" index.js

# Verify the change
grep "limit: '10mb'" index.js

# Update Nginx config
sudo nano /etc/nginx/sites-available/fongoai.com
# Inside the /webhook location block, add: client_max_body_size 10M;

# Or use sed:
sudo sed -i '/location \/webhook {/,/proxy_read_timeout 30;/a \        client_max_body_size 10M;' /etc/nginx/sites-available/fongoai.com

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Restart app
pm2 restart nucleusai

# Check status
pm2 status
pm2 logs nucleusai --lines 20
```

## Manual Edit (Alternative)

If sed doesn't work, manually edit `index.js`:

```bash
nano index.js
```

Find line 36 (or around there):
```javascript
app.use(express.json());
```

Change to:
```javascript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

Save (Ctrl+X, Y, Enter)

## After Applying Fix

1. **Test webhook**:
   ```bash
   curl -X POST http://localhost:3000/webhook \
     -H "Content-Type: application/json" \
     -d '{"event":"test","call":{"call_id":"test-large"}}'
   ```

2. **Make your test call**

3. **Watch logs**:
   ```bash
   pm2 logs nucleusai --lines 0
   ```

4. **Check dashboard**: `http://www.fongoai.com/dashboard`

