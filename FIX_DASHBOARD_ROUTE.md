# Fix Dashboard Route - Run This in DigitalOcean Console

```bash
cd /var/www/nucleusai

# Backup
cp index.js index.js.backup2
cp public/login.html public/login.html.backup

# Fix route mounting (change /dashboard to /dashboard/api)
sed -i "s|app.use('/dashboard', requireAuth, dashboardRoutes);|app.use('/dashboard/api', requireAuth, dashboardRoutes);|" index.js

# Fix login redirect (change / to /dashboard)
sed -i "s|window.location.href = '/';|window.location.href = '/dashboard';|" public/login.html

# Restart
pm2 restart nucleusai

# Test
curl http://localhost:3000/health
curl http://localhost:3000/dashboard
```

## Or manually edit:

1. Edit `index.js` - find line 93 and change:
   ```javascript
   app.use('/dashboard', requireAuth, dashboardRoutes);
   ```
   to:
   ```javascript
   app.use('/dashboard/api', requireAuth, dashboardRoutes);
   ```

2. Edit `public/login.html` - find line 234 and change:
   ```javascript
   window.location.href = '/';
   ```
   to:
   ```javascript
   window.location.href = '/dashboard';
   ```

3. Restart:
   ```bash
   pm2 restart nucleusai
   ```


