# Deploy Dashboard Route Fix

Run this on your server to update the routes:

```bash
cd /var/www/nucleusai && curl -o routes/dashboard.js https://raw.githubusercontent.com/peterthehammer1/FongoAI/main/routes/dashboard.js && pm2 restart nucleusai && echo "✓ Routes fixed and app restarted"
```

This will:
1. Download the fixed dashboard.js from GitHub
2. Restart the app
3. The dashboard should now load calls correctly

