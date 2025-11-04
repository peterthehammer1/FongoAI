# Fix 413 "Request Entity Too Large" Error

## Problem Found!

The logs show **413 errors** on Oct 29 at 14:03:20:
```
[ERROR] Unhandled error {"message":"request entity too large","statusCode":413
```

**Root Cause**: Retell AI webhooks with full transcripts are larger than the default Express.js body size limit (100kb). When Retell AI sends `call_analyzed` events with full transcripts, they get rejected.

## Fix Applied

I've updated:
1. **Express.js body limit**: Increased to 10MB
2. **Nginx client body limit**: Increased to 10MB for webhook endpoint

## Deploy the Fix

### Step 1: Update index.js on Server

In DigitalOcean console, run:

```bash
cd /var/www/nucleusai

# Backup current file
cp index.js index.js.backup

# Update express.json limit
sed -i "s/app.use(express.json());/app.use(express.json({ limit: '10mb' }));/" index.js
sed -i "/express.json({ limit: '10mb' });/a app.use(express.urlencoded({ extended: true, limit: '10mb' }));" index.js
```

Or manually edit `index.js` and change line 36 from:
```javascript
app.use(express.json());
```

To:
```javascript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

### Step 2: Update Nginx Configuration

```bash
# Edit Nginx config
sudo nano /etc/nginx/sites-available/fongoai.com

# In the /webhook location block, add:
client_max_body_size 10M;

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 3: Restart Application

```bash
pm2 restart nucleusai
pm2 logs nucleusai --lines 20
```

## Why This Happened

Retell AI sends comprehensive webhook data including:
- Full call transcripts (can be 50-200KB+)
- Call analysis data
- Transcript objects with timestamps
- Multiple transcript formats

The default Express.js limit (100KB) was too small, causing webhooks to be rejected with 413 errors.

## Impact

- ✅ **Fixed**: Future webhooks will be accepted
- ⚠️ **Missing calls**: Calls between Oct 29 and Nov 3 that had 413 errors won't be in database
- ✅ **Going forward**: All calls will be logged correctly

## Verify Fix

After deploying, test with a large webhook:

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"call_analyzed","call":{"call_id":"test-large","transcript":"'$(python3 -c "print('x' * 200000)")'"}}'
```

Should return success (not 413 error).

