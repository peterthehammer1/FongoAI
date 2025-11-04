# Access Server via DigitalOcean Dashboard

## Quick Access

1. **Go to DigitalOcean Dashboard:**
   - https://cloud.digitalocean.com/droplets

2. **Find your droplet** (IP: 134.122.37.50)

3. **Click on the droplet** to open its details page

4. **Click "Access" → "Launch Droplet Console"**
   - This opens a web-based terminal in your browser
   - No SSH keys needed!

5. **In the console, run:**
   ```bash
   cd /var/www/nucleusai
   pm2 status
   ```

## If App is Not Running

In the DigitalOcean console, run:

```bash
cd /var/www/nucleusai
pm2 restart nucleusai || pm2 start index.js --name nucleusai
pm2 save
pm2 logs nucleusai --lines 20
curl http://localhost:3000/health
```

## Check Server Status

The console will show you:
- Current PM2 processes
- Application logs
- Any errors

## Benefits of Web Console

- ✅ No SSH keys needed
- ✅ Works from any browser
- ✅ Accessible from DigitalOcean dashboard
- ✅ Full terminal access

## Alternative: Check via API

Run the check script:
```bash
node scripts/check-server-status.js
```

This will show:
- Server status (running/stopped)
- Direct link to console
- Direct link to dashboard

