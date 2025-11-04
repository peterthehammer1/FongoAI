# Deploy Error Message Improvements

## Quick Deploy (Run on Server)

Run this command on your DigitalOcean server:

```bash
cd /var/www/nucleusai && git pull origin main && pm2 restart nucleusai && echo "✅ Deployment complete!"
```

## Manual Deploy (If Git Pull Fails)

If you can't pull from GitHub, download files directly:

```bash
cd /var/www/nucleusai

# Download files from GitHub
curl -o routes/webhook.js https://raw.githubusercontent.com/peterthehammer1/FongoAI/main/routes/webhook.js
curl -o public/dashboard.html https://raw.githubusercontent.com/peterthehammer1/FongoAI/main/public/dashboard.html
curl -o public/call-details.html https://raw.githubusercontent.com/peterthehammer1/FongoAI/main/public/call-details.html
curl -o services/errorMessages.js https://raw.githubusercontent.com/peterthehammer1/FongoAI/main/services/errorMessages.js

# Restart application
pm2 restart nucleusai
```

## Verify Deployment

1. Check PM2 status:
   ```bash
   pm2 status
   ```

2. Check logs:
   ```bash
   pm2 logs nucleusai --lines 20
   ```

3. Test dashboard:
   - Visit: https://fongoai.com/dashboard
   - Check a failed call to see the enhanced error display

## Files Changed

- `routes/webhook.js` - Enhanced error handling with technical + actionable messages
- `public/dashboard.html` - Improved error display in table
- `public/call-details.html` - Enhanced error display with technical details
- `services/errorMessages.js` - New service for clear, actionable error messages

