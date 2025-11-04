# Fix Dashboard - Simple One-Liner

Run this on your DigitalOcean server:

```bash
cd /var/www/nucleusai && curl -o public/dashboard.html https://raw.githubusercontent.com/peterthehammer1/FongoAI/main/public/dashboard.html && ls -lh public/dashboard.html && pm2 restart nucleusai && echo "✓ Dashboard fixed!"
```

This will:
1. Download the correct dashboard.html from your GitHub repo
2. Show the file size (should be ~26KB, not 14 bytes)
3. Restart the app
4. Confirm it's done

Then try accessing `http://fongoai.com/dashboard` - it should work!

