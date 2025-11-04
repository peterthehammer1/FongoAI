# Fix Dashboard 404 Issue

## Quick Diagnostic

Run this on your server:

```bash
cd /var/www/nucleusai
node test-dashboard-route.js
```

## Common Issues and Fixes

### Issue 1: File doesn't exist
**Check:**
```bash
ls -la public/dashboard.html
```

**Fix if missing:**
```bash
# Upload the file from local machine
scp public/dashboard.html root@134.122.37.50:/var/www/nucleusai/public/
```

### Issue 2: Session not persisting
**Check session config in index.js:**
```bash
grep -A 10 "session({" index.js
```

**Fix:** Ensure `sameSite: 'lax'` and `secure: false` for HTTP

### Issue 3: Route not matching
**Check route order:**
```bash
grep -n "app.get('/dashboard" index.js
```

The route should be defined BEFORE the catch-all route at the end.

### Issue 4: Auth middleware issue
**Test auth:**
```bash
curl -v http://localhost:3000/dashboard
# Should redirect to /login if not authenticated
```

### Issue 5: Check actual error in browser
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab - what status code is returned?
- Check if session cookie is set after login

## Quick Fix Script

```bash
cd /var/www/nucleusai

# 1. Verify file exists
if [ ! -f "public/dashboard.html" ]; then
    echo "❌ dashboard.html missing!"
    exit 1
fi

# 2. Verify route exists
if ! grep -q "app.get('/dashboard', requireAuth" index.js; then
    echo "❌ Dashboard route missing!"
    exit 1
fi

# 3. Test route
echo "Testing route..."
curl -v http://localhost:3000/dashboard 2>&1 | head -15

# 4. Check logs
echo ""
echo "Recent errors:"
pm2 logs nucleusai --lines 10 --nostream | grep -i "error\|404"
```

## Manual Test

1. **Login first:**
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"cody@fongo.com","password":"Fongo2025!Cody"}' \
     -c /tmp/cookies.txt -v
   ```

2. **Then access dashboard:**
   ```bash
   curl http://localhost:3000/dashboard -b /tmp/cookies.txt -v
   ```

