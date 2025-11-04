# Disable Vercel Deployment

## Problem
Your domain `fongoai.com` is currently pointing to Vercel, but this application is **NOT compatible with Vercel** because:
- ❌ Uses SQLite database (file system is read-only on Vercel)
- ❌ Uses WebSocket server (not supported on Vercel serverless)
- ❌ Needs persistent file storage for logs
- ❌ Requires session storage (not supported on Vercel)

## Solution: Point Domain to DigitalOcean

### Option 1: Remove Vercel Deployment (Recommended)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Find your project** for `fongoai.com`
3. **Delete the project** or **Remove the domain** from Vercel
4. **Update DNS** to point to DigitalOcean instead

### Option 2: Update DNS Records

Make sure your DNS records point to DigitalOcean:

**In your domain registrar (where you bought fongoai.com):**

Update A records:
```
Type: A
Name: @
Value: 134.122.37.50
TTL: 3600

Type: A
Name: www
Value: 134.122.37.50
TTL: 3600
```

**Remove any CNAME records** that point to Vercel (usually something like `cname.vercel-dns.com`)

### Option 3: Disable Vercel Configuration

If you want to keep the code but prevent accidental deployment to Vercel:

1. Rename `vercel.json` to `vercel.json.disabled`
2. This will prevent Vercel from auto-deploying

## After DNS Update

1. **Wait 5-60 minutes** for DNS propagation
2. **Test the domain**: `curl http://fongoai.com/health`
3. **Should return**: `{"status":"OK",...}` from DigitalOcean server

## Verify DNS is Correct

Run this command to check where your domain is pointing:

```bash
nslookup fongoai.com
dig fongoai.com
```

It should show `134.122.37.50` (DigitalOcean), NOT a Vercel IP address.

## Current Error

The error you're seeing:
```
Error: ENOENT: no such file or directory, mkdir '/var/log/nucleusai'
```

This happens because:
- Vercel's filesystem is read-only
- The app tries to create `/var/log/nucleusai` directory
- This fails on Vercel's serverless environment

**Solution**: Point DNS to DigitalOcean where the app is properly deployed.

